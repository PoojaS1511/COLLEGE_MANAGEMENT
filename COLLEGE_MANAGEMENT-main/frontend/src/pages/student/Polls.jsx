import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { checkDatabaseSchema, getPolls, submitVote } from '../../utils/dbUtils';

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    initializePolls();
  }, []);

  const initializePolls = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check database status
      const schemaCheck = await checkDatabaseSchema();
      setDbStatus(schemaCheck);
      console.log('Database status:', schemaCheck);

      // Fetch polls
      const { data, error: fetchError } = await getPolls();
      
      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        console.log('No polls found');
        setPolls([]);
      } else {
        await processPolls(data);
      }
    } catch (err) {
      console.error('Error initializing polls:', err);
      setError(`Failed to load polls: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const processPolls = async (pollsData) => {
    try {
      if (!pollsData || pollsData.length === 0) {
        setPolls([]);
        return;
      }

      // Check if user has already voted on each poll
      const pollsWithVoteStatus = await Promise.all(pollsData.map(async (poll) => {
        if (!user?.id) {
          return { ...poll, hasVoted: false };
        }

        const { data: vote, error: voteError } = await supabase
          .from('votes')
          .select('id')
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (voteError) {
          console.error(`Error checking vote for poll ${poll.id}:`, voteError);
        }

        return {
          ...poll,
          hasVoted: !!vote,
          options: poll.options || []
        };
      }));

      console.log('Processed polls:', pollsWithVoteStatus);
      setPolls(pollsWithVoteStatus);
    } catch (err) {
      console.error('Error processing polls:', err);
      setError(`Failed to process polls: ${err.message || 'Unknown error'}`);
    }
  };

  const handleVoteClick = async (pollId, optionId, event) => {
    // Prevent default form submission if called from a form
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!user) {
      setError('You must be logged in to vote');
      return;
    }

    try {
      setLoading(true);
      // Get the current session to access the auth user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user?.id) {
        throw new Error('Could not authenticate user');
      }
      
      const { data, error } = await submitVote(pollId, optionId, session.user.id);
      
      if (error) throw error;
      
      // Update the local state to reflect the vote without a full page reload
      setPolls(prevPolls => 
        prevPolls.map(poll => {
          if (poll.id === pollId) {
            const updatedOptions = poll.options.map(opt => {
              if (opt.id === optionId) {
                return { ...opt, votes: (opt.votes || 0) + 1 };
              }
              return opt;
            });
            
            return {
              ...poll,
              hasVoted: true,
              options: updatedOptions,
              total_votes: (poll.total_votes || 0) + 1
            };
          }
          return poll;
        })
      );
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(`Failed to submit vote: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-gray-600">Loading polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">Check the browser console for more details.</p>
            {dbStatus && (
              <div className="mt-2 p-2 bg-red-100 rounded">
                <p className="text-xs font-medium">Database Status:</p>
                <pre className="text-xs overflow-auto">{JSON.stringify(dbStatus, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={initializePolls}
            className="text-sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meal Polls</h1>
        <p className="text-gray-600">Vote for your preferred meal options</p>
      </div>

      {polls.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No active polls available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">{poll.title}</CardTitle>
                <div className="text-sm text-gray-500">
                  <p>Day: {poll.day}</p>
                  <p>Meal: {poll.meal}</p>
                  <p>Total Votes: {poll.total_votes || 0}</p>
                  <p>Status: {poll.is_closed ? 'Closed' : 'Open'}</p>
                  <p>Created: {format(new Date(poll.created_at), 'MMM d, yyyy')}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {poll.hasVoted ? (
                  <div className="bg-green-50 text-green-800 p-3 rounded-md">
                    You have already voted on this poll.
                    {poll.options?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium">Poll Options:</p>
                        <ul className="space-y-1">
                          {poll.options.map(option => (
                            <li key={option.id} className="flex justify-between text-sm">
                              <span>{option.name}</span>
                              <span className="font-medium">{option.votes || 0} votes</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : poll.is_closed ? (
                  <div className="bg-gray-100 text-gray-600 p-3 rounded-md">
                    This poll is closed for voting.
                    {poll.options?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm font-medium">Results:</p>
                        <ul className="space-y-1">
                          {poll.options.map(option => (
                            <li key={option.id} className="flex justify-between text-sm">
                              <span>{option.name}</span>
                              <span className="font-medium">{option.votes || 0} votes</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Options:</p>
                    <ul className="space-y-2">
                      {poll.options?.map(option => (
                        <li key={option.id}>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={(e) => handleVoteClick(poll.id, option.id, e)}
                          >
                            {option.name}
                            {option.description && (
                              <span className="ml-2 text-xs text-gray-500 truncate">
                                {option.description}
                              </span>
                            )}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleVoteClick(poll.id)}
                  disabled={poll.hasVoted || poll.is_closed}
                  className={`w-full ${
                    poll.hasVoted || poll.is_closed ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {poll.hasVoted ? 'View Results' : poll.is_closed ? 'Poll Closed' : 'Vote Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Polls;
