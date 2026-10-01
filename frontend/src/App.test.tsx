import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({})
      })
    );
  });

  it('renders the CyberOps landing screen', () => {
    render(<App />);

    expect(screen.getByText('CYBEROPS')).toBeInTheDocument();
    expect(screen.getAllByText('Train. Investigate. Respond.').length).toBeGreaterThan(0);
  });
});
