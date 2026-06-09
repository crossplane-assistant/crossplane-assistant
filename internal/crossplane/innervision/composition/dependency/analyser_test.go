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
