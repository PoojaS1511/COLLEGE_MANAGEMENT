-- Create a function to mark attendance with marks in a single transaction
CREATE OR REPLACE FUNCTION public.mark_attendance_with_marks(
  attendance_records JSONB[],
  marks_data JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attendance_count INTEGER;
  marks_count INTEGER;
  result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert attendance records
    IF array_length(attendance_records, 1) > 0 THEN
      INSERT INTO attendance (
        id, batch_id, subject_id, faculty_id, student_id, 
        date, type, is_present, created_at, updated_at
      )
      SELECT 
        (item->>'id')::UUID,
        (item->>'batch_id')::UUID,
        (item->>'subject_id')::UUID,
        (item->>'faculty_id')::UUID,
        (item->>'student_id')::UUID,
        (item->>'date')::DATE,
        item->>'type',
        (item->>'is_present')::BOOLEAN,
        (item->>'created_at')::TIMESTAMPTZ,
        (item->>'updated_at')::TIMESTAMPTZ
      FROM jsonb_array_elements(attendance_records::jsonb) AS item;
      
      GET DIAGNOSTICS attendance_count = ROW_COUNT;
    END IF;
    
    -- Insert marks for present students
    IF array_length(marks_data, 1) > 0 THEN
      INSERT INTO marks (
        id, student_id, subject_id, batch_id, 
        marks_obtained, date, created_at, updated_at
      )
      SELECT 
        (item->>'id')::UUID,
        (item->>'student_id')::UUID,
        (item->>'subject_id')::UUID,
        (item->>'batch_id')::UUID,
        (item->>'marks_obtained')::NUMERIC,
        (item->>'date')::DATE,
        (item->>'created_at')::TIMESTAMPTZ,
        (item->>'updated_at')::TIMESTAMPTZ
      FROM jsonb_array_elements(marks_data::jsonb) AS item
      WHERE (item->>'marks_obtained')::NUMERIC IS NOT NULL;
      
      GET DIAGNOSTICS marks_count = ROW_COUNT;
    END IF;
    
    -- Return success response
    result := jsonb_build_object(
      'success', true,
      'attendance_records_affected', COALESCE(attendance_count, 0),
      'marks_records_affected', COALESCE(marks_count, 0)
    );
    
    -- Commit transaction
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction on error
    RAISE EXCEPTION 'Error in mark_attendance_with_marks: %', SQLERRM;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.mark_attendance_with_marks(JSONB[], JSONB[]) TO authenticated;
