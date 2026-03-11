# backend/scraper.py
import requests
from bs4 import BeautifulSoup
from flask import Blueprint, jsonify
import json

bp = Blueprint('scraper', __name__)

def scrape_coursera_courses():
    """Scrape courses from Coursera"""
    url = "https://www.coursera.org/courses"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        courses = []
        
        for course in soup.select('.cds-9'):
            title_elem = course.select_one('.cds-119')
            link_elem = course.find('a', href=True)
            
            if title_elem and link_elem:
                courses.append({
                    'title': title_elem.text.strip(),
                    'url': f"https://www.coursera.org{link_elem['href']}",
                    'platform': 'Coursera',
                    'image_url': 'https://s3.amazonaws.com/coursera/topics/coursera3/favicon.png'
                })
                
        return courses[:6]  # Limit to 6 courses
    except Exception as e:
        print(f"Error scraping Coursera: {str(e)}")
        return []

def scrape_edx_courses():
    """Scrape courses from edX"""
    url = "https://www.edx.org/learn/computer-science"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        courses = []
        
        for course in soup.select('.discovery-card'):
            title_elem = course.select_one('.discovery-card-link')
            if title_elem:
                courses.append({
                    'title': title_elem.text.strip(),
                    'url': f"https://www.edx.org{title_elem['href']}",
                    'platform': 'edX',
                    'image_url': 'https://www.edx.org/favicon.ico'
                })
                
        return courses[:6]  # Limit to 6 courses
    except Exception as e:
        print(f"Error scraping edX: {str(e)}")
        return []

@bp.route('/api/career-courses', methods=['GET'])
def get_career_courses():
    """Endpoint to get career courses from multiple sources"""
    try:
        # Get courses from different sources
        coursera_courses = scrape_coursera_courses()
        edx_courses = scrape_edx_courses()
        
        # Combine all courses
        all_courses = coursera_courses + edx_courses
        
        return jsonify({
            'success': True,
            'data': all_courses
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
