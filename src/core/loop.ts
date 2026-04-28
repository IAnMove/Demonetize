type UpdateCallback = (deltaSeconds: number) => void;
type RenderCallback = (deltaSeconds: number, alpha: number) => void;

export class FixedStepLoop {
  private accumulator = 0;

  private animationFrameId = 0;

  private previousTime = 0;

  private running = false;

  constructor(
    private readonly fixedStepSeconds: number,
    private readonly update: UpdateCallback,
    private readonly render: RenderCallback,
    private readonly maxStepsPerFrame = 4
  ) {}

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.previousTime = performance.now();
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    window.cancelAnimationFrame(this.animationFrameId);
  }

  private tick = (currentTime: number): void => {
    if (!this.running) {
      return;
    }

    const rawDeltaSeconds = Math.max(
      0,
      (currentTime - this.previousTime) / 1000
    );
    const maxFrameSeconds = this.fixedStepSeconds * this.maxStepsPerFrame;
    const deltaSeconds = Math.min(maxFrameSeconds, rawDeltaSeconds);
    this.previousTime = currentTime;
    this.accumulator += deltaSeconds;

    let stepsThisFrame = 0;

    while (
      this.accumulator >= this.fixedStepSeconds &&
      stepsThisFrame < this.maxStepsPerFrame
    ) {
      this.update(this.fixedStepSeconds);
      this.accumulator -= this.fixedStepSeconds;
      stepsThisFrame += 1;
    }

    if (stepsThisFrame >= this.maxStepsPerFrame) {
      this.accumulator = Math.min(this.accumulator, this.fixedStepSeconds);
    }

    this.render(deltaSeconds, this.accumulator / this.fixedStepSeconds);
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  };
}
