from flask import Blueprint, jsonify, request
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse
import random
import time
import os
import json
from supabase import create_client

bp = Blueprint('course_scraper', __name__)

# Initialize Supabase client
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

CACHE_DURATION = 24 * 60 * 60  # 24 hours in seconds

# Common headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'DNT': '1',
}

def get_random_delay():
    """Return a random delay between requests to be nice to servers"""
    return random.uniform(1, 3)

def get_domain(url):
    """Extract domain from URL"""
    return urlparse(url).netloc

def scrape_coursera():
    """Scrape free courses from Coursera"""
    try:
        url = "https://www.coursera.org/courses?query=free"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        courses = []
        
        for course_elem in soup.select('.cds-9 .css-1d8n9bt'):
            title_elem = course_elem.select_one('h2')
            org_elem = course_elem.select_one('p[data-test="browsy-product-organization"]')
            
            if not title_elem or not org_elem:
                continue
                
            course = {
                'title': title_elem.get_text(strip=True),
                'platform': 'Coursera',
                'organization': org_elem.get_text(strip=True),
                'url': urljoin('https://www.coursera.org', course_elem.get('href', '')),
                'description': course_elem.select_one('p[data-test="browsy-product-description"]').get_text(strip=True) if course_elem.select_one('p[data-test="browsy-product-description"]') else '',
                'category': 'Online Course',
                'thumbnail': course_elem.select_one('img')['src'] if course_elem.select_one('img') else ''
            }
            courses.append(course)
            
        return courses[:10]  # Limit to 10 courses
        
    except Exception as e:
        print(f"Error scraping Coursera: {str(e)}")
        return []

def scrape_edx():
    """Scrape free courses from edX"""
    try:
        url = "https://www.edx.org/search?tab=course&price=price-free"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        courses = []
        
        for course_elem in soup.select('.discovery-card'):
            title_elem = course_elem.select_one('.discovery-card-link')
            org_elem = course_elem.select_one('.discovery-card-org')
            
            if not title_elem or not org_elem:
                continue
                
            course = {
                'title': title_elem.get_text(strip=True),
                'platform': 'edX',
                'organization': org_elem.get_text(strip=True),
                'url': urljoin('https://www.edx.org', title_elem['href']),
                'description': course_elem.select_one('.discovery-card-description').get_text(strip=True) if course_elem.select_one('.discovery-card-description') else '',
                'category': 'Online Course',
                'thumbnail': course_elem.select_one('img')['src'] if course_elem.select_one('img') else ''
            }
            courses.append(course)
            
        return courses[:10]  # Limit to 10 courses
        
    except Exception as e:
        print(f"Error scraping edX: {str(e)}")
        return []

def scrape_classcentral():
    """Scrape free courses from Class Central"""
    try:
        url = "https://www.classcentral.com/"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html-parse')
        courses = []
        
        for course_elem in soup.select('.course-list-course'):
            title_elem = course_elem.select_one('h2 a')
            org_elem = course_elem.select_one('.text-2.medium-up-text-1.color-gray')
            
            if not title_elem or not org_elem:
                continue
                
            course = {
                'title': title_elem.get_text(strip=True),
                'platform': 'Class Central',
                'organization': org_elem.get_text(strip=True),
                'url': urljoin('https://www.classcentral.com', title_elem['href']),
                'description': course_elem.select_one('p.text-3.medium-up-text-2.line-tight').get_text(strip=True) if course_elem.select_one('p.text-3.medium-up-text-2.line-tight') else '',
                'category': 'Online Course',
                'thumbnail': course_elem.select_one('img')['src'] if course_elem.select_one('img') else ''
            }
            courses.append(course)
            
        return courses[:10]  # Limit to 10 courses
        
    except Exception as e:
        print(f"Error scraping Class Central: {str(e)}")
        return []

def get_cached_courses():
    """Get courses from cache if they're still fresh"""
    try:
        cache = supabase.table('course_cache').select('*').eq('id', 1).execute()
        
        if cache.data and len(cache.data) > 0:
            cache_data = cache.data[0]
            last_updated = datetime.fromisoformat(cache_data['updated_at'])
            
            if (datetime.utcnow() - last_updated).total_seconds() < CACHE_DURATION:
                return cache_data['data']
                
    except Exception as e:
        print(f"Error getting cached courses: {str(e)}")
        
    return None

def cache_courses(courses):
    """Cache the courses in the database"""
    try:
        supabase.table('course_cache').upsert({
            'id': 1,
            'data': courses,
            'updated_at': datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        print(f"Error caching courses: {str(e)}")

@bp.route('/courses', methods=['GET'])
def get_courses():
    """Get all available courses, either from cache or by scraping"""
    try:
        # Try to get cached courses first
        cached_courses = get_cached_courses()
        if cached_courses:
            return jsonify({
                'success': True,
                'data': cached_courses,
                'cached': True
            })
        
        # If no cache or cache is stale, scrape websites
        all_courses = []
        
        # Scrape from multiple sources
        all_courses.extend(scrape_coursera())
        time.sleep(get_random_delay())
        
        all_courses.extend(scrape_edx())
        time.sleep(get_random_delay())
        
        all_courses.extend(scrape_classcentral())
        
        # Deduplicate by URL
        unique_courses = {course['url']: course for course in all_courses}.values()
        
        # Cache the results
        cache_courses(list(unique_courses))
        
        return jsonify({
            'success': True,
            'data': list(unique_courses),
            'cached': False
        })
        
    except Exception as e:
        print(f"Error in get_courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'data': []
        }), 500

@bp.route('/courses/refresh', methods=['POST'])
def refresh_courses():
    """Force refresh the courses cache by scraping websites"""
    try:
        # Scrape from all sources
        all_courses = []
        all_courses.extend(scrape_coursera())
        time.sleep(get_random_delay())
        
        all_courses.extend(scrape_edx())
        time.sleep(get_random_delay())
        
        all_courses.extend(scrape_classcentral())
        
        # Deduplicate by URL
        unique_courses = {course['url']: course for course in all_courses}.values()
        
        # Update cache
        cache_courses(list(unique_courses))
        
        return jsonify({
            'success': True,
            'message': 'Courses refreshed successfully',
            'count': len(unique_courses)
        })
        
    except Exception as e:
        print(f"Error in refresh_courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
