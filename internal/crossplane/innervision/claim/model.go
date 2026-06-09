package claim

type ResourceRef struct {
	APIVersion string `json:"apiVersion"`
	Kind       string `json:"kind"`
	Name       string `json:"name"`
	Namespace  string `json:"namespace"`
}

type Node struct {

	// metav1.TypeMeta
	Kind    string `json:"kind"`
	Version string `json:"version"`
	Index   *int   `json:"index,omitempty"`

	// metav1.ObjectMeta
	Namespace       string `json:"namespace,omitempty"`
	Name            string `json:"name"`
	Uid             string `json:"uid,omitempty"`
	ResourceVersion string `json:"resourceVersion,omitempty"`
	Generation      int64  `json:"generation,omitempty"`

	// Conditions
	Conditions []Condition `json:"conditions,omitempty"`

	Manifest interface{} `json:"manifest,omitempty"`
	MetaKind string      `json:"metaKind"`

	Children []*Node `json:"children,omitempty"`
}

type Condition struct {
	Type    string `json:"type,omitempty"`
	Status  string `json:"status,omitempty"`
	Reason  string `json:"reason,omitempty"`
	Message string `json:"message,omitempty"`
}

type Tree struct {
	Root *Node `json:"root"`
}

func (n *Node) AddChild(child *Node) *Node {
	n.Children = append(n.Children, child)
	return child
}

func (n *Node) NewChild() *Node {
	child := &Node{}
	n.Children = append(n.Children, child)
	return child
}
