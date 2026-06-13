package dependency

import (
	"fmt"
	"os"
	"testing"

	v1 "github.com/crossplane/crossplane/apis/apiextensions/v1"
	"github.com/stretchr/testify/assert"
	yaml2 "k8s.io/apimachinery/pkg/util/yaml"
)

func loadComposition() (*v1.Composition, error) {
	c := &v1.Composition{}
	yamlFile, err := os.ReadFile("./testdata/composition.yaml")
	if err != nil {
		return nil, err
	}

	if err := yaml2.Unmarshal(yamlFile, c); err != nil {
		return nil, err
	}
	return c, nil
}

func TestAnalyser(t *testing.T) {

	c, err := loadComposition()
	if err != nil {
		t.Errorf("Fail to load composition testcase: %s", err)
		return
	}

	analyser := NewAnalyser()

	err = analyser.Load(c)
	if err != nil {
		assert.NoError(t, err, "Fail to analyse composition")
		return
	}

	for idx, tmpl := range analyser.resourcesIndex {

		println("Resource: ", *tmpl.Name)

		dst := analyser.GetEdgesByDst(idx)
		println("Inputs: ")
		for _, inEdge := range dst {
			println(fmt.Sprintf("%s ==(%s)==>%s ", inEdge.Src.String(), inEdge.Path, inEdge.Dst.String()))
		}

		//
		src := analyser.GetEdgesBySrc(idx)
		println("Outputs: ")
		for _, outEdge := range src {
			println(fmt.Sprintf("%s ==(%s)==> %s", outEdge.Src.String(), outEdge.Path, outEdge.Dst.String()))
		}
		println("____________________________________")

	}
}

func TestPipelineAnalyser(t *testing.T) {
	c := &v1.Composition{}
	yamlFile, err := os.ReadFile("./testdata/pipeline_composition.yaml")
	if err != nil {
		t.Fatalf("Fail to load pipeline composition: %s", err)
	}
	if err := yaml2.Unmarshal(yamlFile, c); err != nil {
		t.Fatalf("Fail to unmarshal pipeline composition: %s", err)
	}

	analyser := NewAnalyser()
	err = analyser.Load(c)
	assert.NoError(t, err)

	// Verify that resources are correctly extracted
	assert.Equal(t, 2, len(analyser.resources))
	assert.Equal(t, "DbSubnetGroup", *analyser.resources[0].Name)
	assert.Equal(t, "RDSInstance", *analyser.resources[1].Name)

	// Get computed edges
	graph, err := analyser.GetResourceGraph()
	assert.NoError(t, err)

	// We expect 1 edge from DbSubnetGroup (index 0) to RDSInstance (index 1)
	assert.Equal(t, 1, len(graph.Edges))
	assert.Equal(t, 0, graph.Edges[0].Src.ResourceRef.Index)
	assert.Equal(t, 1, graph.Edges[0].Dst.ResourceRef.Index)
	assert.Equal(t, "status.atProvider.dbSubnetGroupId", graph.Edges[0].Path)
}
