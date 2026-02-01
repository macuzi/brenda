// The main return type from scanPage()

export interface ScanResult {
  url: string;                    
  issues: Issue[];                
  images: ImageMissingAlt[];      
}

export interface Issue {
  id: string;                     
  impact: Impact;                 
  description: string;            
  html: string;                   
  selector: string;               
}

export type Impact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface ImageMissingAlt {
  src: string;                    
  alt: string | null;             
  selector: string;               
}

export interface ImageWithFix extends ImageMissingAlt {
  suggestedAlt: string;           
  fix: {
    before: string;               
    after: string;                
  };
}

// What the /api/scan endpoint returns

export interface ScanResponse {
  url: string;
  scannedAt: string;              
  summary: {
    totalIssues: number;
    imagesMissingAlt: number;
  };
  issues: Issue[];
  images: ImageWithFix[];
}

export interface ScanError {
  error: string;
  details?: string;
}
