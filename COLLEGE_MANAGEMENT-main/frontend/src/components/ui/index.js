// UI Components Index
// Export all UI components from a central location

// Card components
export { Card, CardHeader, CardTitle, CardContent } from './card';

// Button components
export { Button } from './button';

// Input components
export { Input } from './input';

// Select components
export { Select } from './select';

// Table components
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from './table';

// Badge components
export { Badge } from './badge';

// Alert components
export { Alert, AlertDescription } from './alert';

// Spinner components
export { Spinner } from './spinner';

// Modal components
export { Modal } from './modal';

// Progress components
export { Progress } from './progress';

// Checkbox components
export { Checkbox } from './checkbox';

// Pagination components
export { Pagination } from './pagination';

// Form components
export { Form } from './form';

// Date Picker components
export { DatePicker } from './date-picker';

// Stat Card components
export { StatCard } from './stat-card';

// Dropdown components
export { Dropdown } from './dropdown';

// Toast components
export { toast } from './use-toast';

// Notification components
export const notification = (options) => {
  const { title, message, type, ...rest } = options;
  return toast({
    title,
    description: message,
    variant: type,
    ...rest
  });
};
