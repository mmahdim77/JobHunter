import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JobSearchFormProps {
  onSearch: (data: any) => void;
}

export default function JobSearchForm({ onSearch }: JobSearchFormProps) {
  const [formData, setFormData] = useState({
    search_term: '',
    location: '',
    results_wanted: 20,
    hours_old: 72,
    site_name: ['indeed', 'linkedin'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'results_wanted' || name === 'hours_old' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="search_term" className="block text-sm font-medium text-gray-700">
          Job Title
        </label>
        <input
          type="text"
          id="search_term"
          name="search_term"
          value={formData.search_term}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="results_wanted" className="block text-sm font-medium text-gray-700">
            Number of Results
          </label>
          <input
            type="number"
            id="results_wanted"
            name="results_wanted"
            value={formData.results_wanted}
            onChange={handleChange}
            min="1"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="hours_old" className="block text-sm font-medium text-gray-700">
            Jobs Posted Within (hours)
          </label>
          <input
            type="number"
            id="hours_old"
            name="hours_old"
            value={formData.hours_old}
            onChange={handleChange}
            min="1"
            max="168"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Sites
        </label>
        <div className="space-y-2">
          {['indeed', 'linkedin'].map((site) => (
            <label key={site} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.site_name.includes(site)}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    site_name: e.target.checked
                      ? [...prev.site_name, site]
                      : prev.site_name.filter(s => s !== site)
                  }));
                }}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{site}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Search Jobs
      </button>
    </form>
  );
} 