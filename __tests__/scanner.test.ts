import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

import { scanPage } from '@/lib/scanner';

test('scanPage returns issues and images', async () => {                                                                                                                                                         
  const result = await scanPage('https://www.solidroad.com/');                                                                                                                                                   
                                                                                                                                                                                                                 
  console.log('Issues:', result.issues.length);                                                                                                                                                                  
  console.log('Images missing alt:', result.images.length);                                                                                                                                                      
  console.log(JSON.stringify(result, null, 2));                                                                                                                                                                  
                                                                                                                                                                                                                 
  expect(result.url).toBe('https://www.solidroad.com/');                                                                                                                                                         
  expect(result.issues).toBeDefined();                                                                                                                                                                           
  expect(result.images).toBeDefined();                                                                                                                                                                           
});  