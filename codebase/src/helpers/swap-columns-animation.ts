class SwapColumnsAnimation {
  swapWithNext(index: number): void {
    const current = this.gradesData();
    if (index >= current.length - 1) {
      return;
    }

    // 1) FIRST: снимаем позиции колонок по шапке
    const firstPositions = this.captureColumnPositions();

    // 2) меняем порядок грейдов в модели
    const next = [...current];
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    this.gradesData.set(next);

    // 3) LAST + INVERT + PLAY: после перерендера таблицы
    setTimeout(() => {
      this.playFlip(firstPositions);
    });
  }

  /**
   * Снимем "первые" позиции колонок по header-селкам.
   * Ключ — grade.id, значение — координата left.
   */
  private captureColumnPositions(): Map<string, number> {
    const root = this.host.nativeElement as HTMLElement;
    const result = new Map<string, number>();

    for (const grade of this.gradesData()) {
      const header = root.querySelector<HTMLElement>(
        `.grade-header-cell-${grade.id}`,
      );

      if (!header) {
        continue;
      }

      const rect = header.getBoundingClientRect();
      result.set(grade.id, rect.left);
    }

    return result;
  }

  /**
   * FLIP-анимация: для каждой колонки считаем dx и анимируем
   * header + body + footer.
   */
  private playFlip(firstPositions: Map<string, number>): void {
    const root = this.host.nativeElement as HTMLElement;
    const grades = this.gradesData();

    grades.forEach((grade) => {
      const prevLeft = firstPositions.get(grade.id);
      if (prevLeft == null) {
        return;
      }

      const header = root.querySelector<HTMLElement>(
        `.grade-header-cell-${grade.id}`,
      );
      if (!header) {
        return;
      }

      const newLeft = header.getBoundingClientRect().left;
      const dx = prevLeft - newLeft;
      if (!dx) {
        return;
      }

      const selector = [
        `.grade-header-cell-${grade.id}`,
        `.grade-cell-${grade.id}`,
        `.grade-footer-cell-${grade.id}`,
      ].join(', ');

      const cells = root.querySelectorAll<HTMLElement>(selector);

      const distance = Math.abs(dx);

      // duration адаптируем под расстояние: чем дальше, тем чуть дольше,
      // но в разумных пределах
      const duration = Math.min(1520, Math.max(1260, 1260 + distance * 0.3));

      cells.forEach((el) => {
        el.classList.add('grade-animating');

        const overshootX = -dx * 0.03; // лёгкий перелёт

        const animation = el.animate(
          [
            {
              // старт: ещё в старой позиции, но почти без изменения масштаба
              transform: `translateX(${dx}px) scale(0.995)`,
              opacity: 1,
            },
            {
              // мягкий перелёт
              transform: `translateX(${overshootX}px) scale(1.005)`,
              opacity: 1,
            },
            {
              // финал
              transform: 'translateX(0) scale(1)',
              opacity: 1,
            },
          ],
          {
            duration,
            easing: 'cubic-bezier(0.23, 1, 0.32, 1)', // плавный ease-out (почти "apple")
          },
        );

        animation.finished
          .catch(() => {})
          .finally(() => {
            el.classList.remove('grade-animating');
          });
      });
    });
  }
}
