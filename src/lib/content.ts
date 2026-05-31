import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'node-html-parser';

export interface BusinessContent {
  professionalName: string;
  specialty: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  schedule: string;
  raw: string;
}

function getText(root: ReturnType<typeof parse>, selector: string): string {
  return root.querySelector(selector)?.text?.trim() ?? '';
}

function getAttr(root: ReturnType<typeof parse>, selector: string, attr: string): string {
  return root.querySelector(selector)?.getAttribute(attr)?.trim() ?? '';
}

let cached: BusinessContent | null = null;

export function getBusinessContent(): BusinessContent {
  if (cached) return cached;

  const htmlPath = resolve(process.cwd(), 'src/content/index.html');
  const raw = readFileSync(htmlPath, 'utf-8');
  const root = parse(raw);

  const services: string[] = [];
  root.querySelectorAll('ul li, .service, .services li').forEach((el) => {
    const text = el.text.trim();
    if (text) services.push(text);
  });

  cached = {
    professionalName:
      getText(root, 'h1') ||
      getText(root, '.name') ||
      getText(root, '#name') ||
      getText(root, 'title'),
    specialty:
      getText(root, '.specialty') ||
      getText(root, '#specialty') ||
      getText(root, 'h2'),
    description:
      getText(root, '.description') ||
      getText(root, '#description') ||
      getText(root, 'p'),
    address:
      getText(root, '.address') ||
      getText(root, '#address') ||
      getText(root, '[itemprop="address"]'),
    phone:
      getText(root, '.phone') ||
      getText(root, '#phone') ||
      getText(root, '[itemprop="telephone"]') ||
      getAttr(root, 'a[href^="tel:"]', 'href').replace('tel:', ''),
    email:
      getText(root, '.email') ||
      getText(root, '#email') ||
      getText(root, '[itemprop="email"]') ||
      getAttr(root, 'a[href^="mailto:"]', 'href').replace('mailto:', ''),
    website:
      getAttr(root, 'a[href^="http"]', 'href') ||
      getText(root, '.website') ||
      getText(root, '#website'),
    services,
    schedule:
      getText(root, '.schedule') ||
      getText(root, '#schedule') ||
      getText(root, '.hours') ||
      getText(root, '#hours'),
    raw,
  };

  return cached;
}
