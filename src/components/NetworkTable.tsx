import { NetworkRequest, ComponentWithDarkMode } from '../types';

interface NetworkTableProps extends ComponentWithDarkMode {
  requests: NetworkRequest[];
}

export function NetworkTable({ requests, darkMode }: NetworkTableProps) {
  const baseClasses = darkMode ? {
    container: 'bg-gray-800 text-white',
    header: 'text-gray-300',
    row: 'border-gray-700',
    text: 'text-gray-100'
  } : {
    container: 'bg-white text-gray-900',
    header: 'text-gray-500',
    row: 'border-gray-200',
    text: 'text-gray-900'
  };

  return (
    <div className={`rounded-lg shadow p-6 ${baseClasses.container}`}>
      <h2 className="text-xl font-semibold mb-4">Recent Network Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${baseClasses.header}`}>
                URL
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${baseClasses.header}`}>
                Duration
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${baseClasses.header}`}>
                Time
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${baseClasses.row}`}>
            {requests.map((request, index) => (
              <tr key={index}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                  {request.url.split('/').pop()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                  {request.duration.toFixed(2)}ms
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${baseClasses.text}`}>
                  {new Date(request.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}