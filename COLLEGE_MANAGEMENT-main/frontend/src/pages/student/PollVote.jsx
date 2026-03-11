import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AuthContext } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { toast } from 'react-toastify';

const PollVote = () => {
  const { pollId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPollData();
  }, [pollId, user?.id]);

  const fetchPollData = async () => {
    try {
      setLoading(true);
      
      // Fetch poll details
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;
      if (!pollData) throw new Error('Poll not found');

      setPoll(pollData);

      // Check if user has already voted
      const { data: voteData } = await supabase
        .from('votes')
        .select('option_id')
        .eq('poll_id', pollId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (voteData) {
        setHasVoted(true);
        setSelectedOption(voteData.option_id);
      }

      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('name', { ascending: true });

      if (optionsError) throw optionsError;

      setOptions(optionsData || []);
    } catch (err) {
      console.error('Error fetching poll data:', err);
      setError('Failed to load poll data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    try {
      setSubmitting(true);

      // Record the vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert([{
          poll_id: pollId,
          user_id: user.id,
          option_id: selectedOption
        }]);

      if (voteError) throw voteError;

      // Update the vote count for the selected option
      const { error: optionError } = await supabase.rpc('increment_vote', {
        option_id: selectedOption
      });

      if (optionError) throw optionError;

      // Update the total votes count for the poll
      const { error: pollError } = await supabase.rpc('increment_poll_votes', {
        poll_id: pollId
      });

      if (pollError) throw pollError;

      toast.success('Vote submitted successfully!');
      setHasVoted(true);
      // Refresh the data
      fetchPollData();
    } catch (err) {
      console.error('Error submitting vote:', err);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Poll not found or you don't have permission to view it.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = options.reduce((sum, option) => sum + (option.votes || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="outline"
        onClick={() => navigate('/student/votes')}
        className="mb-6"
      >
        ← Back to Polls
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Day: {poll.day}</p>
            <p>Meal: {poll.meal}</p>
            <p>Total Votes: {totalVotes}</p>
            <p>Status: {poll.is_closed ? 'Closed' : 'Open'}</p>
          </div>
        </CardHeader>
        
        <CardContent>
          {poll.is_closed && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">This poll is now closed for voting.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <RadioGroup
              value={selectedOption}
              onValueChange={(value) => setSelectedOption(value)}
              className="space-y-2"
              disabled={hasVoted || poll.is_closed}
            >
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={option.id}
                    id={`option-${option.id}`}
                    disabled={hasVoted || poll.is_closed}
                  />
                  <Label htmlFor={`option-${option.id}`} className="flex-1">
                    <div className="flex justify-between items-center">
                      <span>{option.name}</span>
                      {hasVoted && (
                        <span className="text-sm text-gray-500">
                          {Math.round((option.votes / totalVotes) * 100) || 0}% ({option.votes || 0} votes)
                        </span>
                      )}
                    </div>
                    {hasVoted && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${Math.round((option.votes / totalVotes) * 100) || 0}%` }}
                        ></div>
                      </div>
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {hasVoted ? (
              <div className="mt-6 p-4 bg-green-50 text-green-800 rounded-md">
                <p>Thank you for voting!</p>
                <p className="text-sm mt-1">You can view the results above.</p>
              </div>
            ) : poll.is_closed ? (
              <div className="mt-6 p-4 bg-gray-100 text-gray-600 rounded-md">
                This poll is closed for voting.
              </div>
            ) : (
              <Button
                onClick={handleVote}
                disabled={!selectedOption || submitting}
                className="mt-6 w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PollVote;
