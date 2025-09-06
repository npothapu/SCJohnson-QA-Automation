import { Page } from '@playwright/test';

export async function delay(ms: number): Promise<void> {
return new Promise(resolve => setTimeout(resolve, ms));
}

export function escapeRegExp(string: string): string {
return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function setupConsoleErrorHandling(page: Page): void {
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log(`Console error on ${page.url()}: ${msg.text()}`);
  }
});
}

