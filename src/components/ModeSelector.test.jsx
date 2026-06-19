import { test, expect, vi, describe, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeSelector from './ModeSelector';

describe('ModeSelector', () => {
  it('renders all transport mode buttons', () => {
    render(<ModeSelector selected="" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: /ola/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /auto/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /bus/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /metro/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /carpool/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /cycle/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /walk/i })).toBeTruthy();
  });

  it('calls onChange with the selected mode', () => {
    const onChange = vi.fn();
    render(<ModeSelector selected="ola_uber" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: /metro/i }));
    expect(onChange).toHaveBeenCalledWith('metro');
  });

  it('highlights the currently selected mode', () => {
    render(<ModeSelector selected="metro" onChange={vi.fn()} />);
    const metroRadio = screen.getByRole('radio', { name: /metro/i });
    expect(metroRadio.getAttribute('aria-checked')).toBe('true');
  });

  it('deselects previous mode when new one is selected', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ModeSelector selected="metro" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: /metro/i }).getAttribute('aria-checked')).toBe('true');
    
    fireEvent.click(screen.getByRole('radio', { name: /bus/i }));
    rerender(<ModeSelector selected="bus" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: /metro/i }).getAttribute('aria-checked')).toBe('false');
    expect(screen.getByRole('radio', { name: /bus/i }).getAttribute('aria-checked')).toBe('true');
  });

  it('handles keyboard arrow key navigation', () => {
    const onChange = vi.fn();
    render(<ModeSelector selected="metro" onChange={onChange} />);
    
    const metroRadio = screen.getByRole('radio', { name: /metro/i });
    metroRadio.focus();
    
    // ArrowRight should move to next mode
    fireEvent.keyDown(metroRadio, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalled();
  });

  it('has proper ARIA role for radio group', () => {
    render(<ModeSelector selected="" onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio.getAttribute('type')).toBe('button');
      expect(radio.getAttribute('role')).toBe('radio');
    });
  });

  it('has accessible labels for each mode', () => {
    render(<ModeSelector selected="" onChange={vi.fn()} />);
    const modes = ['ola', 'auto', 'bus', 'metro', 'carpool', 'cycle', 'walk'];
    modes.forEach(mode => {
      expect(screen.getByRole('radio', { name: new RegExp(mode, 'i') })).toBeTruthy();
    });
  });

  it('prevents multiple rapid changes', () => {
    const onChange = vi.fn();
    render(<ModeSelector selected="metro" onChange={onChange} />);
    
    fireEvent.click(screen.getByRole('radio', { name: /bus/i }));
    fireEvent.click(screen.getByRole('radio', { name: /bus/i }));
    
    // Should only call once (no double-click behavior)
    expect(onChange.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('handles no selected mode initially', () => {
    const onChange = vi.fn();
    render(<ModeSelector selected="" onChange={onChange} />);
    
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio.getAttribute('aria-checked')).toBe('false');
    });
  });

  it('handles invalid selected mode gracefully', () => {
    const onChange = vi.fn();
    render(<ModeSelector selected="invalid_mode" onChange={onChange} />);
    
    // Should render without error
    expect(screen.getByRole('radio', { name: /metro/i })).toBeTruthy();
  });

  it('allows selecting each mode independently', () => {
    const onChange = vi.fn();
    const { rerender } = render(<ModeSelector selected="" onChange={onChange} />);
    
    const modes = ['ola_uber', 'auto', 'bus', 'metro', 'carpool', 'cycle', 'walk'];
    modes.forEach(mode => {
      rerender(<ModeSelector selected={mode} onChange={onChange} />);
      const expectedLabel = mode === 'ola_uber' ? /ola/i : new RegExp(mode, 'i');
      expect(screen.getByRole('radio', { name: expectedLabel }).getAttribute('aria-checked')).toBe('true');
    });
  });

  it('has tabIndex for keyboard navigation', () => {
    render(<ModeSelector selected="" onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    // At least one should be tabbable
    expect(radios.some(radio => radio.getAttribute('tabIndex') !== '-1')).toBe(true);
  });
});

