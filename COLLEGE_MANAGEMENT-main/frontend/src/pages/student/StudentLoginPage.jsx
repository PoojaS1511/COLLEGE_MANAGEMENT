import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import StudentLogin from '../../components/student/StudentLogin';

function StudentLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is a student
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (student) {
          navigate('/student/dashboard');
        } else {
          // If logged in but not a student, sign out
          await supabase.auth.signOut();
        }
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <StudentLogin />
    </div>
  );
}

export default StudentLoginPage;
