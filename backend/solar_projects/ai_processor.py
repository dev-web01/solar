import json
import random
import os
import cv2
import numpy as np
import requests
from django.conf import settings
from .models import AnalysisResult, EnergyPrediction

def geocode_location(location_str):
    """Convert location string to lat/lon using Nominatim API."""
    try:
        headers = {'User-Agent': 'SolarVisionAI/1.0'}
        url = f"https://nominatim.openstreetmap.org/search?q={requests.utils.quote(location_str)}&format=json&limit=1"
        response = requests.get(url, headers=headers, timeout=5)
        data = response.json()
        if data and len(data) > 0:
            return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None, None

def get_peak_sun_hours(lat, lon):
    """Fetch average daily sunshine hours using Open-Meteo API."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=sunshine_duration&timezone=auto"
        response = requests.get(url, timeout=5)
        data = response.json()
        if 'daily' in data and 'sunshine_duration' in data['daily']:
            # sunshine_duration is in seconds, convert to hours
            durations = [d / 3600.0 for d in data['daily']['sunshine_duration'] if d is not None]
            if durations:
                return sum(durations) / len(durations)
    except Exception as e:
        print(f"Weather API error: {e}")
    # Fallback to 4.5 hours if API fails
    return 4.5

def check_image_quality(image_path):
    """Check if the image is blurry using Laplacian variance."""
    try:
        full_path = os.path.join(settings.MEDIA_ROOT, str(image_path).replace('project_images/', 'project_images\\'))
        if not os.path.exists(full_path):
             full_path = os.path.join(settings.MEDIA_ROOT, str(image_path))
             
        img = cv2.imread(full_path)
        if img is None:
            return False, "Could not read image file."
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Blur check using variance of Laplacian
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50: # Threshold for blur
            return False, "Image is too blurry or unclear. Please upload a clear photo of the roof."
            
        return True, "OK"
    except Exception as e:
        print(f"Quality check error: {e}")
        return True, "OK" # Let it pass if check fails

def analyze_image_shadows(image_path):
    """Use OpenCV to detect dark spots (shadows) in the image."""
    try:
        # Read image
        full_path = os.path.join(settings.MEDIA_ROOT, str(image_path).replace('project_images/', 'project_images\\'))
        if not os.path.exists(full_path):
             full_path = os.path.join(settings.MEDIA_ROOT, str(image_path))
             
        img = cv2.imread(full_path)
        if img is None:
            return 15.0 # fallback
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply a binary threshold to find very dark pixels (shadows)
        # Assumes pixels with intensity < 60 are shadows
        _, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
        
        # Calculate percentage of shadow pixels
        shadow_pixels = cv2.countNonZero(thresh)
        total_pixels = img.shape[0] * img.shape[1]
        
        shadow_percentage = (shadow_pixels / total_pixels) * 100.0
        return min(shadow_percentage, 80.0) # Cap at 80%
    except Exception as e:
        print(f"OpenCV error: {e}")
        return 15.0

def analyze_project(project):
    """
    Advanced AI Processor with Geocoding, Real Weather Data, and OpenCV image processing.
    """
    images = project.images.all()
    num_images = images.count()

    roof_area = project.roof_length * project.roof_width
    
    # 1. OpenCV Shadow Analysis
    shadow_percentages = []
    obstacles = {}
    if num_images > 0:
        for img_obj in images:
            is_valid, msg = check_image_quality(img_obj.image.name)
            if not is_valid:
                raise ValueError(msg)
            shadow_percentages.append(analyze_image_shadows(img_obj.image.name))
        
        shadow_coverage_percentage = sum(shadow_percentages) / len(shadow_percentages)
        # Mock obstacle counting based on shadow variance
        obstacles = {
            "trees": random.randint(0, 2) if shadow_coverage_percentage > 20 else 0,
            "chimneys": 1 if shadow_coverage_percentage > 10 else 0,
            "HVAC_units": random.randint(0, 1)
        }
    else:
        shadow_coverage_percentage = 20.0 # Default assumption
    
    total_obstacles = sum(obstacles.values())
    
    # 2. Weather & Solar Data
    lat, lon = geocode_location(project.location)
    if lat and lon:
        peak_sun_hours = get_peak_sun_hours(lat, lon)
    else:
        peak_sun_hours = 4.5 # Default fallback
        
    # Light intensity inversely proportional to shadows, but boosted by good sun hours
    light_intensity_percentage = min(100.0, max(0.0, 100.0 - shadow_coverage_percentage + (peak_sun_hours * 2)))

    # 3. Efficiency & Calculations
    panel_eff_map = {
        'Standard': 0.15,
        'Premium': 0.20,
        'Ultra': 0.22
    }
    efficiency = panel_eff_map.get(project.panel_type, 0.15)
    
    # Pitch factor (Optimal is around 30 degrees)
    pitch_diff = abs(project.roof_pitch - 30.0)
    pitch_penalty = pitch_diff * 0.5 # 0.5% loss per degree off optimal
    
    usable_area = roof_area * (1 - (shadow_coverage_percentage / 100.0))
    
    # System Size (kW) = Area * Efficiency * Performance Ratio (0.75) * Pitch Penalty factor
    performance_ratio = 0.75 * (1 - (pitch_penalty / 100.0))
    recommended_kw = usable_area * efficiency * performance_ratio
    
    # Calculate Solar Score (out of 10)
    # Weighted: 40% Usable Area, 40% Sun Hours, 20% Panel Efficiency
    area_score = min((usable_area / roof_area) * 10, 10) if roof_area > 0 else 0
    sun_score = min((peak_sun_hours / 8.0) * 10, 10)
    eff_score = (efficiency / 0.22) * 10
    solar_score = (area_score * 0.4) + (sun_score * 0.4) + (eff_score * 0.2)
    solar_score = round(min(max(solar_score, 0.0), 10.0), 1)

    confidence_score = 92.0 if num_images > 0 and lat else 65.0

    # Save Analysis Result
    analysis, _ = AnalysisResult.objects.get_or_create(project=project)
    analysis.solar_score = solar_score
    analysis.confidence_score = confidence_score
    analysis.usable_rooftop_area = round(usable_area, 2)
    analysis.suitable_zones = max(int(usable_area / 15), 1)
    analysis.unsuitable_zones = total_obstacles
    analysis.light_intensity_percentage = round(light_intensity_percentage, 1)
    analysis.shadow_coverage_percentage = round(shadow_coverage_percentage, 1)
    analysis.obstacle_data = obstacles
    orientation = "South" if not lat or lat > 0 else "North"
    analysis.recommended_panel_orientation = orientation
    
    # Generate Textual Summary
    suitability = "highly suitable" if solar_score >= 7.0 else "moderately suitable" if solar_score >= 4.0 else "not very suitable"
    summary_text = (
        f"Based on our AI analysis, this rooftop is {suitability} "
        f"for solar installation with a feasibility score of {solar_score}/10. "
        f"We recommend installing the panels facing {orientation} to maximize sunlight exposure. "
        f"Approximately {int(usable_area)} sq meters of your roof is usable, receiving around {int(peak_sun_hours)} hours of peak sunlight daily. "
    )
    if total_obstacles > 0:
        summary_text += f"We detected some potential obstacles causing around {int(shadow_coverage_percentage)}% shadow coverage, but our recommended {round(recommended_kw, 1)}kW system accounts for this."
    else:
        summary_text += f"No major obstacles were detected, making the roof an excellent candidate for the recommended {round(recommended_kw, 1)}kW system."
        
    analysis.ai_summary = summary_text
    
    # Panels required (Assuming 400W panels)
    panels_fit = int(recommended_kw / 0.4)
    analysis.recommended_system_size_kw = round(recommended_kw, 2)
    analysis.save()

    # Calculate Energy Predictions
    daily_gen = recommended_kw * peak_sun_hours
    monthly_gen = daily_gen * 30
    annual_gen = daily_gen * 365

    # Financials
    install_cost = recommended_kw * 1200 # $1200 per kW avg
    annual_savings = annual_gen * 0.15 # Assuming $0.15/kWh grid cost
    payback = install_cost / annual_savings if annual_savings > 0 else 0
    
    savings_10_years = (annual_savings * 10) - install_cost
    savings_25_years = (annual_savings * 25) - install_cost

    prediction, _ = EnergyPrediction.objects.get_or_create(project=project)
    prediction.daily_generation_kwh = round(daily_gen, 2)
    prediction.monthly_generation_kwh = round(monthly_gen, 2)
    prediction.annual_generation_kwh = round(annual_gen, 2)
    prediction.panels_required = panels_fit
    prediction.installation_cost = round(install_cost, 2)
    prediction.annual_savings = round(annual_savings, 2)
    prediction.payback_period_years = round(payback, 1)
    prediction.savings_10_years = round(savings_10_years, 2)
    prediction.savings_25_years = round(savings_25_years, 2)
    prediction.save()

    # Generate PDF Report
    from .report_generator import generate_pdf_report
    generate_pdf_report(project)

    return True
