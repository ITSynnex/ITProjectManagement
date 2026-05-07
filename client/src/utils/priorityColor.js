export const priorityColor = (priority) => ({
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low:    'bg-green-100 text-green-700',
}[priority] || 'bg-gray-100 text-gray-700');

export const statusColor = (status) => ({
  'Active':      'bg-blue-100 text-blue-700',
  'On Hold':     'bg-yellow-100 text-yellow-700',
  'Completed':   'bg-green-100 text-green-700',
  'To Do':       'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done':        'bg-green-100 text-green-700',
  'Pending':     'bg-gray-100 text-gray-600',
  'In Review':   'bg-blue-100 text-blue-700',
  'Converted':   'bg-green-100 text-green-700',
  'Rejected':    'bg-red-100 text-red-700',
}[status] || 'bg-gray-100 text-gray-600');
