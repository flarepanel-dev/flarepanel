import { describe, expect, it } from 'bun:test';
import { EMPTY_STATE, type MonitorState, nextState } from './incidents';

function run(
  states: ('up' | 'down' | 'degraded')[],
  start: MonitorState = EMPTY_STATE
) {
  let state = start;
  const actions: string[] = [];
  for (const s of states) {
    const next = nextState(state, s);
    state = next.state;
    if (next.action?.type === 'open') {
      state = { ...state, incidentId: 'inc-1' };
      actions.push('open');
    } else if (next.action) {
      actions.push(next.action.type);
    }
  }
  return { state, actions };
}

describe('automatic incidents', () => {
  it('ignores a single failed check', () => {
    expect(run(['down', 'up', 'down', 'up']).actions).toEqual([]);
  });

  it('opens after two failures in a row, once', () => {
    expect(run(['down', 'down', 'down', 'down']).actions).toEqual(['open']);
  });

  it('resolves after three good checks in a row', () => {
    const { actions, state } = run(['down', 'down', 'up', 'up', 'up']);
    expect(actions).toEqual(['open', 'resolve']);
    expect(state.incidentId).toBeNull();
  });

  it('does not resolve on a flapping service', () => {
    expect(
      run(['down', 'down', 'up', 'up', 'down', 'up', 'up']).actions
    ).toEqual(['open']);
  });

  it('counts a slow answer as answering', () => {
    expect(run(['down', 'down', 'degraded', 'degraded', 'up']).actions).toEqual(
      ['open', 'resolve']
    );
  });
});
