import robotsParser from 'robots-parser';
export async function loadRobotsTxt(baseUrl: string): Promise<any> {
try {
  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  if (robotsResponse.ok) {
    const robotsContent = await robotsResponse.text();
    const robotsTxt = robotsParser(`${baseUrl}/robots.txt`, robotsContent);
    console.log('Successfully loaded robots.txt');
    return robotsTxt;
  }
} catch (e) {
  console.log('No robots.txt found or error parsing it:', e);
}
return null;
}

export function isUrlAllowed(robotsTxt: any, url: string): boolean {
if (!robotsTxt) return true;
return robotsTxt.isAllowed(url, 'PlaywrightBot');
}