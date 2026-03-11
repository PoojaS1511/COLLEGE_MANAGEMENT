/**
 * Analyzes a resume and provides ATS scoring and corrections
 * @param {File} file - The resume file to analyze
 * @returns {Promise<Object>} Analysis results with score and corrections
 */
export const analyzeResume = async (file) => {
  try {
    // Read the file as text
    const text = await readFileAsText(file);
    
    // Simple ATS scoring
    const score = calculateATSScore(text);
    const corrections = suggestCorrections(text);
    
    return {
      success: true,
      data: {
        score,
        text,
        corrections,
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified
      }
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze resume',
    };
  }
};

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content as text
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error reading file: ' + error.message));
    };
    
    if (file.type === 'application/pdf') {
      // For PDFs, we'll extract text using a simple approach
      // Note: This is a basic implementation and may not work perfectly for all PDFs
      reader.readAsBinaryString(file);
    } else {
      // For text-based files (TXT, DOC, DOCX)
      reader.readAsText(file);
    }
  });
}

/**
 * Calculate ATS score based on resume text
 * @param {string} text - The resume text
 * @returns {number} ATS score (0-100)
 */
function calculateATSScore(text) {
  // Simple scoring based on common ATS criteria
  const keywords = [
    'skills', 'experience', 'education', 'certifications',
    'leadership', 'projects', 'achievements', 'technical',
    'programming', 'languages', 'tools', 'frameworks',
    'summary', 'objective', 'work history', 'professional experience'
  ];
  
  const lowerText = text.toLowerCase();
  const matchedKeywords = keywords.filter(keyword => 
    lowerText.includes(keyword)
  );
  
  // Base score on percentage of matched keywords (0-70% of total score)
  const keywordScore = (matchedKeywords.length / keywords.length) * 70;
  
  // Additional points for structure (30% of total score)
  const sectionPattern = /(education|experience|skills|projects|certifications|summary|objective|work\s*history|professional\s*experience):?\s*\n/gi;
  const hasSections = sectionPattern.test(text) ? 30 : 0;
  
  // Additional points for contact information
  const hasContactInfo = /(phone|email|linkedin|github|portfolio|@|\.com|\.in|\+\d)/i.test(text) ? 15 : 0;
  
  // Additional points for action verbs
  const actionVerbs = [
    'achieved', 'managed', 'developed', 'led', 'increased', 'improved',
    'created', 'implemented', 'designed', 'trained', 'organized', 'planned',
    'delivered', 'optimized', 'resolved', 'spearheaded', 'transformed'
  ];
  const actionVerbsCount = actionVerbs.filter(verb => 
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  ).length;
  const actionVerbsScore = Math.min((actionVerbsCount / 5) * 15, 15); // Max 15 points
  
  return Math.min(Math.round(keywordScore + hasSections + hasContactInfo + actionVerbsScore), 100);
}

/**
 * Suggest corrections for the resume
 * @param {string} text - The resume text
 * @returns {Array<string>} List of suggested corrections
 */
function suggestCorrections(text) {
  const suggestions = [];
  const lowerText = text.toLowerCase();
  
  // Check for contact information
  if (!/(phone|mobile|email|@|\.com|\.in|\+\d)/i.test(text)) {
    suggestions.push('Add contact information (email, phone, LinkedIn)');
  }
  
  // Check for summary/objective
  if (!/(summary|objective):?\s*\n/i.test(text)) {
    suggestions.push('Add a professional summary or objective statement');
  }
  
  // Check for skills section
  if (!/skills?:\s*\n/i.test(text)) {
    suggestions.push('Add a dedicated skills section with relevant keywords');
  }
  
  // Check for work experience
  if (!/(experience|work\s*history|professional\s*experience):?\s*\n/i.test(text)) {
    suggestions.push('Include a work experience section with your job history');
  }
  
  // Check for education
  if (!/education:?\s*\n/i.test(text)) {
    suggestions.push('Add an education section with your degrees and institutions');
  }
  
  // Check for action verbs
  const actionVerbs = [
    'achieved', 'managed', 'developed', 'led', 'increased', 'improved',
    'created', 'implemented', 'designed', 'trained', 'organized', 'planned'
  ];
  
  const hasActionVerbs = actionVerbs.some(verb => 
    new RegExp(`\\b${verb}\\b`, 'i').test(text)
  );
  
  if (!hasActionVerbs) {
    suggestions.push('Use more action verbs to describe your experience (e.g., "developed", "managed", "increased")');
  }
  
  // Check for quantifiable achievements
  if (!/(\d+%|\$\d+|\d+\+?\s*(years?|yrs?|months?|days?|\$|%|people|team|clients?|projects?))/i.test(text)) {
    suggestions.push('Include quantifiable achievements (e.g., "Increased sales by 20%" or "Managed a team of 5")');
  }
  
  return suggestions.length > 0 
    ? suggestions 
    : ['Your resume looks well-structured! Make sure to customize it for each job application.'];
}

export default {
  analyzeResume,
};
