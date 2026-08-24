import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import {
  CompositeInputNode,
  ManagedResourceNode,
  CompositeOutputNode,
} from '../src/components/CompositionCanvas';

// The custom node components use <Handle> internally, which reads from the
// ReactFlow zustand store regardless of whether a canvas is rendered, so a
// bare ReactFlowProvider is required even for isolated rendering.
function renderNode(ui: ReactElement) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>);
}

describe('CompositeInputNode', () => {
  test('renders the composite kind and each mapped input field', () => {
    renderNode(
      <CompositeInputNode
        data={{
          kind: 'XPostgreSQLInstance',
          fields: ['spec.parameters.dbSize', 'spec.parameters.region'],
        }}
      />
    );

    expect(screen.getByText('XPostgreSQLInstance')).toBeInTheDocument();
    expect(screen.getByText('spec.parameters.dbSize')).toBeInTheDocument();
    expect(screen.getByText('spec.parameters.region')).toBeInTheDocument();
  });

  test('renders an empty-state message when no fields are mapped', () => {
    renderNode(<CompositeInputNode data={{ kind: 'XSample', fields: [] }} />);
    expect(screen.getByText(/No fields mapped/i)).toBeInTheDocument();
  });
});

describe('ManagedResourceNode', () => {
  test('renders the resource id, kind, and incoming/outgoing fields', () => {
    renderNode(
      <ManagedResourceNode
        data={{
          id: 'DbSubnetGroup',
          kind: 'DBSubnetGroup',
          incomingFields: ['spec.forProvider.size'],
          outgoingFields: ['status.atProvider.endpoint'],
        }}
      />
    );

    expect(screen.getByText('DbSubnetGroup')).toBeInTheDocument();
    expect(screen.getByText('DBSubnetGroup')).toBeInTheDocument();
    expect(screen.getByText('spec.forProvider.size')).toBeInTheDocument();
    expect(screen.getByText('status.atProvider.endpoint')).toBeInTheDocument();
  });
});

describe('CompositeOutputNode', () => {
  test('renders the composite kind and each mapped output field', () => {
    renderNode(
      <CompositeOutputNode
        data={{
          kind: 'XPostgreSQLInstance',
          fields: ['status.dbEndpoint'],
        }}
      />
    );

    expect(screen.getByText('XPostgreSQLInstance')).toBeInTheDocument();
    expect(screen.getByText('status.dbEndpoint')).toBeInTheDocument();
  });

  test('renders an empty-state message when no outputs are mapped', () => {
    renderNode(<CompositeOutputNode data={{ kind: 'XSample', fields: [] }} />);
    expect(screen.getByText(/No outputs mapped/i)).toBeInTheDocument();
  });
});
