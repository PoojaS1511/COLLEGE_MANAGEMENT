import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2 } from 'lucide-react';

export default function StudentResults() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Fetch student's results
        const { data: resultsData, error: resultsError } = await supabase
          .from('internal_marks')
          .select('*')
          .eq('student_id', user.id)
          .order('assessment_type', { ascending: true });

        if (resultsError) throw resultsError;

        // Get unique subject IDs
        const subjectIds = [...new Set(resultsData.map(item => item.faculty_subject_assignment_id))];
        
        // Fetch subject details
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('faculty_subject_assignments')
          .select(`
            id,
            subject:subject_id (id, name, code, subject_type)
          `)
          .in('id', subjectIds);

        if (subjectsError) throw subjectsError;

        // Create a map of subject assignments to subject details
        const subjectsMap = {};
        subjectsData.forEach(item => {
          if (item.subject) {
            subjectsMap[item.id] = {
              subject_name: item.subject.name || 'Unknown Subject',
              subject_code: item.subject.code || 'N/A',
              subject_type: item.subject.subject_type || 'Regular'
            };
          }
        });

        setSubjects(subjectsMap);
        setResults(resultsData || []);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResults();
    }
  }, [user]);

  // Group results by exam and subject
  const groupedResults = results.reduce((acc, result) => {
    const key = `${result.exam_id}-${result.faculty_subject_assignment_id}`;
    if (!acc[key]) {
      const subjectInfo = subjects[result.faculty_subject_assignment_id] || { 
        subject_name: 'Unknown Subject', 
        subject_code: 'N/A',
        subject_type: 'Regular'
      };
      acc[key] = {
        examId: result.exam_id,
        subjectId: result.faculty_subject_assignment_id,
        subject: subjectInfo,
        assessments: []
      };
    }
    if (result.marks_obtained !== null && result.max_marks) {
      acc[key].assessments.push({
        type: result.assessment_type,
        marksObtained: result.marks_obtained,
        maxMarks: result.max_marks,
        percentage: (result.marks_obtained / result.max_marks) * 100,
        remarks: result.remarks || ''
      });
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">My Results</h2>
      </div>

      {Object.keys(groupedResults).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No results found.</p>
          </CardContent>
        </Card>
      ) : (
        Object.values(groupedResults).map((group) => (
          <Card key={`${group.examId}-${group.subjectId}`} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">
                {group.subject.subject_name} ({group.subject.subject_code})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assessment Type</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.assessments.map((assessment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {assessment.type}
                      </TableCell>
                      <TableCell>{assessment.marksObtained}</TableCell>
                      <TableCell>{assessment.maxMarks}</TableCell>
                      <TableCell>
                        {assessment.percentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
