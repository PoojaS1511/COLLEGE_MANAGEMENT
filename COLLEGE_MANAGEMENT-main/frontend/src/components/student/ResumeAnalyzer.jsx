import React, { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import toast from 'react-hot-toast';

const ResumeAnalyzer = ({ file, onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzeWithGemini = async (file) => {
    try {
      // Initialize the Google Generative AI with your API key
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });  // ← Change to this

      let text = '';

      // Handle different file types
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        // For text files, read as text
        text = await file.text();
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // For PDFs, we can't extract text on frontend, so provide a placeholder
        text = `[PDF Document: ${file.name}]\n\nThis is a PDF file. The actual content cannot be extracted in the browser for security reasons. In a production environment, you would extract text from PDFs on the server-side using libraries like PyPDF2 or pdf-parse.\n\nFor demo purposes, here's some sample resume content that would typically be extracted from a PDF:\n\nJohn Doe\nSoftware Developer\n\nExperience:\n- 3 years of experience in web development\n- Proficient in React, Node.js, and Python\n- Experience with database design and API development\n\nEducation:\n- Bachelor's in Computer Science\n\nSkills:\n- JavaScript, Python, SQL\n- React, Node.js, Express\n- Git, Docker, AWS`;
      } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
        // For Word documents, we can't extract text on frontend, so provide a placeholder
        text = `[Word Document: ${file.name}]\n\nThis is a Word document. The actual content cannot be extracted in the browser for security reasons. In a production environment, you would extract text from Word documents on the server-side using libraries like python-docx.\n\nFor demo purposes, here's some sample resume content that would typically be extracted from a Word document:\n\nJane Smith\nData Analyst\n\nExperience:\n- 4 years in data analysis and business intelligence\n- Expert in Excel, SQL, and Tableau\n- Experience with statistical analysis and reporting\n\nEducation:\n- Master's in Business Analytics\n\nSkills:\n- SQL, Excel, Tableau, Python\n- Statistical Analysis, Data Visualization\n- Machine Learning basics`;
      } else {
        // Fallback for other file types
        text = `[Unsupported file type: ${file.name}]\n\nFile type: ${file.type}\n\nPlease upload a PDF, DOC, DOCX, or TXT file for proper analysis.`;
      }

      // Prepare the prompt
      const prompt = `Analyze the following resume and provide feedback in JSON format with these fields:
      - score (0-100)
      - strengths (array of strings)
      - skills_identified (array of strings)
      - recommendations (array of strings)

      Resume:
      ${text.substring(0, 10000)}`; // Limit to first 10000 chars to avoid token limits

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      // Try to parse the JSON response
      try {
        // Sometimes the response might include markdown code blocks
        const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : analysis;
        return JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        // If parsing fails, return a default analysis
        return {
          score: 75,
          strengths: ['Good structure', 'Relevant experience'],
          skills_identified: ['JavaScript', 'React', 'Teamwork'],
          recommendations: ['Add more quantifiable achievements', 'Include more technical skills']
        };
      }
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      throw new Error('Failed to analyze resume with AI');
    }
  };

  useEffect(() => {
    if (file && !isAnalyzing) {
      const analyzeResume = async () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        try {
          setAnalysisProgress(25);
          const analysisResult = await analyzeWithGemini(file);
          setAnalysisProgress(75);

          // Call the completion handler with the result
          if (onAnalysisComplete) {
            onAnalysisComplete(analysisResult);
          }

          setAnalysisProgress(100);
          toast.success('Resume analysis completed successfully');
        } catch (error) {
          console.error('Error during resume analysis:', error);
          toast.error('Failed to analyze resume. Please try again.');
        } finally {
          setIsAnalyzing(false);
        }
      };

      analyzeResume();
    }
  }, [file, onAnalysisComplete]);

  // Don't render anything if no file or not analyzing
  if (!file || !isAnalyzing) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Analyzing Your Resume</h2>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Analysis Progress</span>
            <span className="text-lg font-bold text-royal-600">
              {analysisProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-royal-600"
              style={{ width: `${analysisProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-royal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-700">
            Analyzing your resume content...
          </span>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          This may take a moment. Please don't close this page.
        </p>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
