import sys
import json
import logging
import pandas as pd
from jobspy import scrape_jobs
from datetime import datetime, date
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_value(value):
    """Clean a value for JSON serialization"""
    if pd.isna(value) or value == 'nan' or value == 'NaN':
        return None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, (np.int64, np.float64)):
        return float(value) if not np.isnan(value) else None
    return value

def row_to_dict(row):
    """Convert a DataFrame row to a dictionary, handling NaN values"""
    return {
        'title': clean_value(row.get('title')),
        'company': clean_value(row.get('company')),
        'companyUrl': clean_value(row.get('company_url')),
        'jobUrl': clean_value(row.get('job_url')),
        'location': {
            'country': clean_value(row.get('location_country')),
            'city': clean_value(row.get('location_city')),
            'state': clean_value(row.get('location_state'))
        },
        'isRemote': clean_value(row.get('is_remote')),
        'description': clean_value(row.get('description')),
        'jobType': clean_value(row.get('job_type')),
        'salary': {
            'interval': clean_value(row.get('salary_interval')),
            'minAmount': clean_value(row.get('salary_min_amount')),
            'maxAmount': clean_value(row.get('salary_max_amount')),
            'currency': clean_value(row.get('salary_currency'))
        },
        'datePosted': clean_value(row.get('date_posted')),
        'companyIndustry': clean_value(row.get('company_industry')),
        'companyLogo': clean_value(row.get('company_logo'))
    }

def process_jobs(jobs_df):
    """Process the jobs DataFrame and return a list of job dictionaries"""
    if jobs_df.empty:
        return []
    
    jobs = []
    for _, row in jobs_df.iterrows():
        try:
            job_dict = row_to_dict(row)
            jobs.append(job_dict)
        except Exception as e:
            logger.error(f"Error processing row: {e}")
            continue
    
    return jobs

def main():
    try:
        # Get command line arguments
        search_term = sys.argv[1]
        location = sys.argv[2]
        results_wanted = int(sys.argv[3])
        
        logger.info(f"Searching for jobs with parameters: search_term={search_term}, location={location}, results_wanted={results_wanted}")
        
        # Scrape jobs
        jobs_df = scrape_jobs(
            site_name=['indeed', 'linkedin'],
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=72,
            linkedin_fetch_description=True
        )
        
        logger.info(f"Scraped {len(jobs_df)} jobs")

        # Process the jobs
        processed_jobs = process_jobs(jobs_df)
        
        # Output the processed jobs
        print(json.dumps(processed_jobs, default=str))

    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 