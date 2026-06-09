export interface Node {
  version: string;
  kind: string;
  name: string;
  uid?: string;
  generation?: number;
  resourceVersion?: string;

  namespace?: string;
  metaKind?: string;
  index: number;
  children?: Node[];

  conditions?: Condition[];

  manifest?: any;
}

export interface Tree {
  root: Node;
}

export interface Status {
  conditions: Condition[];
}

enum ConditionStatus {
  True = 'True',
  False = 'False',
  Unknown = 'Unknown',
}

export interface Condition {
  type: string;
  status: ConditionStatus;
  //observedGeneration: number
  lastTransitionTime: Date;
  reason: string;
  message: string;
}
