import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/shared/components/GlassCard';

describe('GlassCard', () => {
  it('children render eder', () => {
    render(<GlassCard><p>Test İçerik</p></GlassCard>);
    expect(screen.getByText('Test İçerik')).toBeInTheDocument();
  });

  it('className ekler', () => {
    const { container } = render(
      <GlassCard className="extra-class">
        <span>İçerik</span>
      </GlassCard>
    );
    expect(container.firstChild).toHaveClass('extra-class');
    expect(container.firstChild).toHaveClass('rounded-3xl');
  });

  it('glassmorphism stilleri uygulanır', () => {
    const { container } = render(
      <GlassCard><span>Stil</span></GlassCard>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.backdropFilter).toContain('blur');
  });

  it('ref forwarding çalışır', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <GlassCard ref={ref}><span>Ref</span></GlassCard>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
