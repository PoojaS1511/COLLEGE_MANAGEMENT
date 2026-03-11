-- Function to get monthly admission trends
CREATE OR REPLACE FUNCTION public.get_monthly_admission_trends(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE(
  month text,
  applications bigint,
  approved bigint,
  rejected bigint
)
LANGUAGE sql
AS $$
  SELECT 
    to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
    COUNT(*) as applications,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected
  FROM 
    admissions
  WHERE 
    created_at BETWEEN start_date AND end_date
  GROUP BY 
    date_trunc('month', created_at)
  ORDER BY 
    month;
$$;

-- Function to get admission course distribution
CREATE OR REPLACE FUNCTION public.get_admission_course_distribution()
RETURNS TABLE(
  course text,
  applications bigint,
  percentage numeric
)
LANGUAGE sql
AS $$
  WITH course_counts AS (
    SELECT 
      course_applied as course,
      COUNT(*) as count
    FROM 
      admissions
    WHERE 
      course_applied IS NOT NULL
    GROUP BY 
      course_applied
  ),
  total AS (
    SELECT COUNT(*) as total FROM admissions
  )
  SELECT 
    course,
    count as applications,
    ROUND((count * 100.0) / (SELECT total FROM total), 2) as percentage
  FROM 
    course_counts
  ORDER BY 
    count DESC;
$$;

-- Function to get admission source distribution
CREATE OR REPLACE FUNCTION public.get_admission_source_distribution()
RETURNS TABLE(
  source text,
  count bigint
)
LANGUAGE sql
AS $$
  SELECT 
    COALESCE(admission_source, 'Unknown') as source,
    COUNT(*) as count
  FROM 
    admissions
  GROUP BY 
    admission_source
  ORDER BY 
    count DESC;
$$;

-- Function to get admission status summary
CREATE OR REPLACE FUNCTION public.get_admission_status_summary()
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_build_object(
    'total_applications', (SELECT COUNT(*) FROM admissions),
    'pending_applications', (SELECT COUNT(*) FROM admissions WHERE status = 'pending'),
    'approved_applications', (SELECT COUNT(*) FROM admissions WHERE status = 'approved'),
    'rejected_applications', (SELECT COUNT(*) FROM admissions WHERE status = 'rejected'),
    'approval_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0 
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'approved') * 100.0) / COUNT(*), 2)
        END
      FROM admissions
    )
  );
$$;

-- Function to get course performance metrics
CREATE OR REPLACE FUNCTION public.get_course_performance_metrics(academic_year integer)
RETURNS TABLE(
  course_id text,
  course_name text,
  average_grade numeric,
  pass_rate numeric,
  top_performer_name text,
  top_performer_grade numeric,
  total_students bigint
)
LANGUAGE sql
AS $$
  WITH course_metrics AS (
    SELECT 
      c.id as course_id,
      c.name as course_name,
      AVG(g.grade) as average_grade,
      COUNT(DISTINCT s.id) as total_students,
      ROUND((COUNT(DISTINCT g.student_id) FILTER (WHERE g.grade >= 50) * 100.0) / 
            NULLIF(COUNT(DISTINCT g.student_id), 0), 2) as pass_rate,
      (SELECT student_name 
       FROM grades 
       WHERE course_id = c.id 
       ORDER BY grade DESC 
       LIMIT 1) as top_student_name,
      (SELECT grade 
       FROM grades 
       WHERE course_id = c.id 
       ORDER BY grade DESC 
       LIMIT 1) as top_grade
    FROM 
      courses c
    LEFT JOIN 
      grades g ON c.id = g.course_id
    LEFT JOIN 
      students s ON g.student_id = s.id
    WHERE 
      EXTRACT(YEAR FROM g.exam_date) = academic_year
    GROUP BY 
      c.id, c.name
  )
  SELECT 
    course_id,
    course_name,
    ROUND(average_grade, 2) as average_grade,
    pass_rate,
    top_student_name as top_performer_name,
    top_grade as top_performer_grade,
    total_students
  FROM 
    course_metrics
  ORDER BY 
    average_grade DESC NULLS LAST;
$$;

-- Function to get performance trends
CREATE OR REPLACE FUNCTION public.get_performance_trends(academic_year integer)
RETURNS TABLE(
  month text,
  course_id text,
  course_name text,
  average_grade numeric,
  pass_rate numeric
)
LANGUAGE sql
AS $$
  SELECT 
    to_char(date_trunc('month', g.exam_date), 'YYYY-MM') as month,
    c.id as course_id,
    c.name as course_name,
    ROUND(AVG(g.grade), 2) as average_grade,
    ROUND((COUNT(DISTINCT g.student_id) FILTER (WHERE g.grade >= 50) * 100.0) / 
          NULLIF(COUNT(DISTINCT g.student_id), 0), 2) as pass_rate
  FROM 
    grades g
  JOIN 
    courses c ON g.course_id = c.id
  WHERE 
    EXTRACT(YEAR FROM g.exam_date) = academic_year
  GROUP BY 
    date_trunc('month', g.exam_date), c.id, c.name
  ORDER BY 
    month, c.name;
$$;

-- Function to get top performers
CREATE OR REPLACE FUNCTION public.get_top_performers(
  academic_year integer,
  limit_count integer
)
RETURNS TABLE(
  student_id text,
  student_name text,
  course_name text,
  grade numeric,
  rank bigint
)
LANGUAGE sql
AS $$
  WITH ranked_grades AS (
    SELECT 
      g.student_id,
      s.full_name as student_name,
      c.name as course_name,
      g.grade,
      ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY g.grade DESC) as rank
    FROM 
      grades g
    JOIN 
      students s ON g.student_id = s.id
    JOIN 
      courses c ON g.course_id = c.id
    WHERE 
      EXTRACT(YEAR FROM g.exam_date) = academic_year
  )
  SELECT 
    student_id,
    student_name,
    course_name,
    grade,
    rank
  FROM 
    ranked_grades
  WHERE 
    rank <= limit_count
  ORDER BY 
    rank, course_name;
$$;

-- Function to get room utilization
CREATE OR REPLACE FUNCTION public.get_room_utilization()
RETURNS TABLE(
  room_id text,
  room_name text,
  capacity integer,
  utilization_percentage numeric,
  peak_hours text
)
LANGUAGE sql
AS $$
  WITH room_bookings AS (
    SELECT 
      r.id as room_id,
      r.name as room_name,
      r.capacity,
      COUNT(b.id) as booking_count,
      (SELECT STRING_AGG(
        EXTRACT(HOUR FROM start_time)::text || ':00-' || EXTRACT(HOUR FROM end_time)::text || ':00', 
        ', '
        ORDER BY COUNT(*) DESC
        LIMIT 3
      )
      FROM bookings
      WHERE room_id = r.id
      GROUP BY EXTRACT(HOUR FROM start_time), EXTRACT(HOUR FROM end_time)
      ORDER BY COUNT(*) DESC
      LIMIT 1) as peak_hours
    FROM 
      rooms r
    LEFT JOIN 
      bookings b ON r.id = b.room_id
    WHERE 
      b.booking_date = CURRENT_DATE
    GROUP BY 
      r.id, r.name, r.capacity
  )
  SELECT 
    room_id,
    room_name,
    capacity,
    ROUND((booking_count * 100.0) / NULLIF(capacity, 0), 2) as utilization_percentage,
    COALESCE(peak_hours, 'No bookings') as peak_hours
  FROM 
    room_bookings
  ORDER BY 
    utilization_percentage DESC NULLS LAST;
$$;

-- Function to get resource utilization
CREATE OR REPLACE FUNCTION public.get_resource_utilization()
RETURNS TABLE(
  resource_id text,
  resource_name text,
  total_quantity integer,
  available_quantity integer,
  utilization_percentage numeric
)
LANGUAGE sql
AS $$
  SELECT 
    r.id as resource_id,
    r.name as resource_name,
    r.quantity as total_quantity,
    (r.quantity - COALESCE(SUM(br.quantity_borrowed), 0)) as available_quantity,
    ROUND((COALESCE(SUM(br.quantity_borrowed), 0) * 100.0) / NULLIF(r.quantity, 0), 2) as utilization_percentage
  FROM 
    resources r
  LEFT JOIN 
    borrowed_resources br ON r.id = br.resource_id AND br.return_date IS NULL
  GROUP BY 
    r.id, r.name, r.quantity
  ORDER BY 
    utilization_percentage DESC NULLS LAST;
$$;

-- Function to get daily utilization trend
CREATE OR REPLACE FUNCTION public.get_daily_utilization_trend(
  start_date timestamp with time zone,
  end_date timestamp with time zone
)
RETURNS TABLE(
  date date,
  room_utilization_percentage numeric,
  resource_utilization_percentage numeric
)
LANGUAGE sql
AS $$
  WITH daily_room_utilization AS (
    SELECT 
      b.booking_date as date,
      ROUND((COUNT(DISTINCT b.room_id) * 100.0) / NULLIF(COUNT(DISTINCT r.id), 0), 2) as room_utilization
    FROM 
      bookings b
    JOIN 
      rooms r ON b.room_id = r.id
    WHERE 
      b.booking_date BETWEEN start_date AND end_date
    GROUP BY 
      b.booking_date
  ),
  daily_resource_utilization AS (
    SELECT 
      br.borrow_date as date,
      ROUND((SUM(br.quantity_borrowed) * 100.0) / NULLIF(SUM(r.quantity), 0), 2) as resource_utilization
    FROM 
      borrowed_resources br
    JOIN 
      resources r ON br.resource_id = r.id
    WHERE 
      br.borrow_date BETWEEN start_date AND end_date
    GROUP BY 
      br.borrow_date
  )
  SELECT 
    COALESCE(ru.date, resu.date) as date,
    COALESCE(ru.room_utilization, 0) as room_utilization_percentage,
    COALESCE(resu.resource_utilization, 0) as resource_utilization_percentage
  FROM 
    daily_room_utilization ru
  FULL OUTER JOIN 
    daily_resource_utilization resu ON ru.date = resu.date
  ORDER BY 
    date;
$$;

-- Function to get utilization summary
CREATE OR REPLACE FUNCTION public.get_utilization_summary()
RETURNS json
LANGUAGE sql
AS $$
  WITH room_stats AS (
    SELECT 
      ROUND(AVG(utilization_percentage), 2) as avg_room_utilization,
      MAX(utilization_percentage) as max_room_utilization,
      (SELECT name FROM rooms WHERE id = (
        SELECT room_id 
        FROM (
          SELECT 
            room_id, 
            COUNT(*) as booking_count
          FROM 
            bookings
          WHERE 
            booking_date = CURRENT_DATE
          GROUP BY 
            room_id
          ORDER BY 
            booking_count DESC
          LIMIT 1
        ) t
      )) as most_used_room
    FROM (
      SELECT 
        room_id,
        (COUNT(*) * 100.0) / (SELECT COUNT(DISTINCT id) FROM rooms) as utilization_percentage
      FROM 
        bookings
      WHERE 
        booking_date = CURRENT_DATE
      GROUP BY 
        room_id
    ) t
  ),
  resource_stats AS (
    SELECT 
      ROUND(AVG(utilization_percentage), 2) as avg_resource_utilization,
      MAX(utilization_percentage) as max_resource_utilization,
      (SELECT name FROM resources WHERE id = (
        SELECT resource_id 
        FROM (
          SELECT 
            resource_id, 
            SUM(quantity_borrowed) as total_borrowed
          FROM 
            borrowed_resources
          WHERE 
            return_date IS NULL
          GROUP BY 
            resource_id
          ORDER BY 
            total_borrowed DESC
          LIMIT 1
        ) t
      )) as most_used_resource
    FROM (
      SELECT 
        resource_id,
        (SUM(quantity_borrowed) * 100.0) / (SELECT SUM(quantity) FROM resources) as utilization_percentage
      FROM 
        borrowed_resources
      WHERE 
        return_date IS NULL
      GROUP BY 
        resource_id
    ) t
  )
  SELECT json_build_object(
    'room_utilization', json_build_object(
      'average', COALESCE(rs.avg_room_utilization, 0),
      'maximum', COALESCE(rs.max_room_utilization, 0),
      'most_used_room', COALESCE(rs.most_used_room, 'No bookings today')
    ),
    'resource_utilization', json_build_object(
      'average', COALESCE(ress.avg_resource_utilization, 0),
      'maximum', COALESCE(ress.max_resource_utilization, 0),
      'most_used_resource', COALESCE(ress.most_used_resource, 'No resources borrowed')
    )
  )
  FROM 
    room_stats rs,
    resource_stats ress;
$$;
