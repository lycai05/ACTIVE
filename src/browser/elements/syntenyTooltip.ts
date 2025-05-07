// syntenyTooltip.ts
export class SyntenyTooltip {
    private tooltip: HTMLElement;
    private container: HTMLElement;
  
    constructor(containerId: string) {
      // 创建tooltip元素
      this.tooltip = document.createElement('div');
      this.tooltip.className = 'synteny-tooltip';
      document.body.appendChild(this.tooltip);
      
      this.container = document.getElementById(containerId) || document.body;
      
      // 添加样式
      const style = document.createElement('style');
      style.textContent = `
        .synteny-tooltip {
          position: fixed;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          padding: 12px;
          font-size: 14px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
          z-index: 1000;
          max-width: 400px;
        }
        
        .synteny-tooltip.visible {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
  
    formatNumber(num: number): string {
      return num.toLocaleString();
    }
  
    formatSequence(seq?: string): string {
      if (!seq) return '';
      return seq.length > 30 ? `${seq.substring(0, 30)}...` : seq;
    }
  
    show(link: any, event: MouseEvent): void {
      const content = `
        <div class="tooltip-header" style="font-weight: bold; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;">
          Synteny Region
        </div>
        <div class="tooltip-content">
          <div style="margin-bottom: 8px;">
            <div>
              <span style="font-weight: 600; color: #374151;">Human:</span>
              <span style="color: #2563eb;">${link.chrom1}:${this.formatNumber(link.start1)}-${this.formatNumber(link.end1)}</span>
              <span style="color: #6b7280;">(${this.formatNumber(link.end1 - link.start1)}bp)</span>
            </div>
            <div>
              <span style="font-weight: 600; color: #374151;">Mouse:</span>
              <span style="color: #2563eb;">${link.chrom2}:${this.formatNumber(link.start2)}-${this.formatNumber(link.end2)}</span>
              <span style="color: #6b7280;">(${this.formatNumber(link.end2 - link.start2)}bp)</span>
            </div>
          </div>
          ${link.query_seq ? `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <div style="font-weight: 600; color: #374151;">Query:</div>
              <div style="font-family: monospace; font-size: 0.875rem; background: #f3f4f6; padding: 4px; border-radius: 4px;">
                ${this.formatSequence(link.query_seq)}
              </div>
              <div style="font-weight: 600; color: #374151; margin-top: 4px;">Target:</div>
              <div style="font-family: monospace; font-size: 0.875rem; background: #f3f4f6; padding: 4px; border-radius: 4px;">
                ${this.formatSequence(link.target_seq)}
              </div>
            </div>
          ` : ''}
        </div>
      `;
  
      this.tooltip.innerHTML = content;
      this.tooltip.classList.add('visible');
  
      // 计算位置
      const rect = this.container.getBoundingClientRect();
      const tooltipRect = this.tooltip.getBoundingClientRect();
      
      let left = event.clientX - tooltipRect.width / 2;
      let top = event.clientY - tooltipRect.height - 10;
  
      // 确保tooltip不会超出视窗
      if (left < 0) left = 0;
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width;
      }
      if (top < 0) top = event.clientY + 10;
  
      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.top = `${top}px`;
    }
  
    hide(): void {
      this.tooltip.classList.remove('visible');
    }
  
    destroy(): void {
      this.tooltip.remove();
    }
  }