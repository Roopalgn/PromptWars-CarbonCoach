import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeSelector from './ModeSelector';

test('clicking a mode calls onChange with that mode', () => {
  const onChange = vi.fn();
  render(<ModeSelector selected="ola_uber" onChange={onChange} />);
  fireEvent.click(screen.getByRole('radio', { name: /metro/i }));
  expect(onChange).toHaveBeenCalledWith('metro');
});
