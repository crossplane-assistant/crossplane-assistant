package dependency

import (
	"fmt"
	"io"

	"github.com/crossplane/crossplane-runtime/pkg/fieldpath"
	"github.com/rs/zerolog/log"
)

func NewPathIndexer() *PathIndexer {
	return &PathIndexer{
		root: &IndexEntry{
			children: make(map[string]*IndexEntry),
		},
	}
}

// PathIndexer allow you to index a path and attach an item to it
// so you can retrieve the item by the path
type PathIndexer struct {
	root *IndexEntry
}

type LookupOptions struct {
	ResolvePrefixed bool
}

// Lookup resolve index node based on the provided path
// if the path is not found, it will return nil
// if opts.ResolvePrefixed is set to true, it will resolve if base of the path match
// Eg. my.path.basepath
// - Match for :  eg. my.path.used.for.lookup  will match for path my.path.used
func (i *PathIndexer) Lookup(path string, opts *LookupOptions) *IndexEntry {
	segments, err := fieldpath.Parse(path)
	if err != nil {
		return nil
	}

	return i.lookup(segments, opts)
}

// Index will index the path and attach the item to it
func (i *PathIndexer) Index(path string, item any) error {

	segments, err := fieldpath.Parse(path)
	if err != nil {
		return err
	}

	node := i.indexSegments(segments)
	node.attachItem(item)

	log.Info().Msgf("Indexed path %s", segments)
	return nil
}

func (i *PathIndexer) indexSegments(segments []fieldpath.Segment) *IndexEntry {

	if len(segments) == 0 {
		return i.root
	}
	var currentNode = i.root

	for _, segment := range segments {
		currentNode = currentNode.getOrCreate(segment)
		if currentNode == nil {
			return nil
		}
	}
	return currentNode
}

// lookup for
func (i *PathIndexer) lookup(segments []fieldpath.Segment, opts *LookupOptions) *IndexEntry {

	if len(segments) == 0 {
		return i.root
	}
	var currentNode = i.root

	for _, segment := range segments {
		currentNode = currentNode.get(segment, opts.ResolvePrefixed)
		if currentNode == nil {
			return nil
		}
	}
	return currentNode
}

func (i *PathIndexer) Print(w io.Writer) error {
	return i.root.print(w, "")
}

type IndexEntry struct {
	key           string
	segment       fieldpath.Segment
	children      map[string]*IndexEntry
	attachedItems []any
}

func (n *IndexEntry) get(segment fieldpath.Segment, partial bool) *IndexEntry {

	key := segment.Field
	if segment.Type == fieldpath.SegmentIndex {
		key = fmt.Sprintf("[%d]", segment.Index)
	}

	// Only the prefix of the patch match.
	// E.g. my.path.base -> my.path.base.end.of.path
	if partial && len(n.children) == 0 {
		return n
	}

	child, ok := n.children[key]
	if !ok {
		return nil
	}
	return child
}

func (n *IndexEntry) getOrCreate(segment fieldpath.Segment) *IndexEntry {

	key := segment.Field
	if segment.Type == fieldpath.SegmentIndex {
		key = fmt.Sprintf("[%d]", segment.Index)
	}

	child, ok := n.children[key]
	if !ok {
		child = &IndexEntry{
			segment:  segment,
			children: make(map[string]*IndexEntry),
			key:      key,
		}
		n.children[key] = child
	}
	return child
}

func (n *IndexEntry) attachItem(item any) {
	n.attachedItems = append(n.attachedItems, item)
}

// print the index
func (n *IndexEntry) print(w io.Writer, indent string) error {

	_, err := fmt.Fprintln(w, indent+n.key)
	if err != nil {
		return err
	}

	for _, child := range n.children {
		err = child.print(w, indent+"  ")
		if err != nil {
			return err
		}
	}
	return nil
}
