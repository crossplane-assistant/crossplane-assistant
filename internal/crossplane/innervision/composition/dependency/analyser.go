package dependency

import (
	"encoding/json"
	"fmt"
	"strings"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/rs/zerolog/log"
)

func NewAnalyser() *Analyser {
	a := &Analyser{
		provideIndexer: NewPathIndexer(),
	}
	return a
}

type Analyser struct {
	provideIndexer *PathIndexer
	composition    *v1.Composition
	resources      []v1.ComposedTemplate

	resourcesIndex map[int]*v1.ComposedTemplate
	edges          []*Edge
}

type PatchAndTransformInput struct {
	Resources []v1.ComposedTemplate `json:"resources"`
}

func extractResourcesFromStepInput(inputRaw []byte) ([]v1.ComposedTemplate, error) {
	var input PatchAndTransformInput
	if err := json.Unmarshal(inputRaw, &input); err != nil {
		return nil, err
	}
	return input.Resources, nil
}

func (a *Analyser) GetEdgesBySrc(srcIdx int) []*Edge {
	res := make([]*Edge, 0)

	for _, e := range a.edges {
		if e.Src.ResourceRef.Index == srcIdx {
			res = append(res, e)
		}
	}
	return res
}

func (a *Analyser) GetEdgesByDst(dstIdx int) []*Edge {
	res := make([]*Edge, 0)

	for _, e := range a.edges {
		if e.Dst.ResourceRef.Index == dstIdx {
			res = append(res, e)
		}
	}
	return res
}

func (a *Analyser) initResourceRef(index int, r *v1.ComposedTemplate) *ResourceRef {
	resourceRef := &ResourceRef{
		Index: index,
	}
	if r.Name != nil {
		resourceRef.Name = r.Name
	}
	return resourceRef
}

func (a *Analyser) Load(c *v1.Composition) error {

	a.composition = c
	a.resources = make([]v1.ComposedTemplate, 0)
	patchSets := c.Spec.PatchSets

	// Build a map of patch sets
	patchSet := make(map[string]v1.PatchSet)
	for _, ps := range patchSets {
		patchSet[ps.Name] = ps
	}

	// Resolve resources
	if len(c.Spec.Resources) > 0 {
		a.resources = c.Spec.Resources
	} else if len(c.Spec.Pipeline) > 0 {
		for _, step := range c.Spec.Pipeline {
			if step.FunctionRef.Name != "" {
				name := step.FunctionRef.Name
				if strings.Contains(strings.ToLower(name), "patch-and-transform") {
					if step.Input != nil && len(step.Input.Raw) > 0 {
						stepResources, err := extractResourcesFromStepInput(step.Input.Raw)
						if err != nil {
							log.Err(err).Msgf("Error extracting resources from pipeline step %s", step.Step)
						} else {
							a.resources = append(a.resources, stepResources...)
						}
					}
				}
			}
		}
	}

	a.resourcesIndex = make(map[int]*v1.ComposedTemplate, len(a.resources))

	// First index all the resources
	for i, r := range a.resources {

		// Initialize the resource index
		a.resourcesIndex[i] = &r
		resourceRef := a.initResourceRef(i, &r)

		// Index the patches values
		for pIdx, p := range r.Patches {

			patches := a.resolvePatchSet(&p, patchSet)
			patchRef := &PatchRef{
				PatchIdx:    pIdx,
				ResourceRef: resourceRef,
			}

			for _, resPatch := range patches {
				if err := a.indexPatch(patchRef, resPatch); err != nil {
					log.Err(err).Msgf("Error indexing patch %v", p)
				}
			}
		}
	}

	a.initEdges()

	return nil
}

func (a *Analyser) initEdges() {

	a.edges = make([]*Edge, 0)
	for i, r := range a.resources {

		consumer := a.resourcesIndex[i]

		for pIdx, p := range r.Patches {

			if p.Type == v1.PatchTypeFromCompositeFieldPath && p.FromFieldPath != nil {
				a.addEdge(*p.FromFieldPath, i, pIdx, consumer)
			}

			if p.Type == v1.PatchTypeCombineFromComposite {
				for _, v := range p.Combine.Variables {
					a.addEdge(v.FromFieldPath, i, pIdx, consumer)
				}
			}
		}
	}
}

func (a *Analyser) addEdge(fieldPath string, i int, pIdx int, consumer *v1.ComposedTemplate) {

	opts := &LookupOptions{
		ResolvePrefixed: true,
	}

	if node := a.provideIndexer.Lookup(fieldPath, opts); node != nil && len(node.attachedItems) > 0 {

		var item interface{}
		item = node.attachedItems[0]

		edge := &Edge{
			Src: item.(*PatchRef),
			Dst: &PatchRef{
				ResourceRef: a.initResourceRef(i, consumer),
				PatchIdx:    pIdx,
			},
			Path: fieldPath,
		}
		a.edges = append(a.edges, edge)
	}
}

// resolvePatchSet resolves the patch set if the values is a patch
func (a *Analyser) resolvePatchSet(p *v1.Patch, patchSetIndex map[string]v1.PatchSet) []*v1.Patch {

	patches := make([]*v1.Patch, 0)

	// Resolve all patch
	if p.Type == v1.PatchTypePatchSet && p.PatchSetName != nil {
		for _, subPatch := range patchSetIndex[*p.PatchSetName].Patches {
			patches = append(patches, &subPatch)
		}
	} else {
		patches = append(patches, p)
	}
	return patches
}

// indexPatch indexes the patch
func (a *Analyser) indexPatch(patchRef *PatchRef, p *v1.Patch) error {

	// Handing out patch
	if p.Type == v1.PatchTypeToCompositeFieldPath && p.ToFieldPath != nil {
		return a.provideIndexer.Index(*p.ToFieldPath, patchRef)
	}
	if p.Type == v1.PatchTypeCombineToComposite {
		return a.provideIndexer.Index(*p.ToFieldPath, patchRef)
	}

	return nil
}

type Edge struct {
	Src  *PatchRef `json:"src"`
	Dst  *PatchRef `json:"dst"`
	Path string    `json:"path"`
}

type ResourceRef struct {
	Name  *string `json:"name"`
	Index int     `json:"index"`
}

func (r *ResourceRef) String() string {
	if r.Name != nil {
		return fmt.Sprintf("[%d]-%s", r.Index, *r.Name)
	}
	return fmt.Sprintf("[%d]", r.Index)
}

type PatchRef struct {
	ResourceRef *ResourceRef `json:"resourceRef"`
	PatchIdx    int          `json:"patchIdx"`
}

func (r *PatchRef) String() string {
	return fmt.Sprintf("%s-patch[%d]", r.ResourceRef.String(), r.PatchIdx)
}

type ResourceGraph struct {
	Resources []v1.ComposedTemplate `json:"resources"`
	Edges     []*Edge               `json:"edges"`
}

func (a *Analyser) GetResourceGraph() (*ResourceGraph, error) {

	graph := &ResourceGraph{
		Resources: a.resources,
		Edges:     a.edges,
	}
	return graph, nil
}
