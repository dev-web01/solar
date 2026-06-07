import os
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from .models import Report

def generate_pdf_report(project):
    """
    Generates a PDF report for the given project using ReportLab.
    """
    # Create the reports directory if it doesn't exist
    reports_dir = os.path.join(settings.MEDIA_ROOT, 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    
    filename = f"report_project_{project.id}.pdf"
    filepath = os.path.join(reports_dir, filename)
    
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, height - 50, "SolarVision AI - Feasibility Report")
    
    # Project Info
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 100, f"Project: {project.name}")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 120, f"Location: {project.location}")
    c.drawString(50, height - 140, f"Roof Dimensions: {project.roof_length}m x {project.roof_width}m")
    
    # Analysis Results
    if hasattr(project, 'analysis'):
        analysis = project.analysis
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, height - 180, "AI Analysis Results")
        c.setFont("Helvetica", 12)
        c.drawString(50, height - 200, f"Solar Feasibility Score: {analysis.solar_score}/10")
        c.drawString(50, height - 220, f"Usable Rooftop Area: {analysis.usable_rooftop_area} sq meters")
        c.drawString(50, height - 240, f"Shadow Coverage: {analysis.shadow_coverage_percentage}%")
        c.drawString(50, height - 260, f"Recommended System Size: {analysis.recommended_system_size_kw} kW")
        
        c.drawString(50, height - 290, "Obstacles Detected:")
        y_pos = height - 310
        for obs, count in analysis.obstacle_data.items():
            if count > 0:
                c.drawString(70, y_pos, f"- {obs.replace('_', ' ').title()}: {count}")
                y_pos -= 20
    else:
        y_pos = height - 200
        c.drawString(50, y_pos, "No analysis available.")
        
    # Energy Predictions
    if hasattr(project, 'prediction'):
        pred = project.prediction
        y_pos -= 40
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_pos, "Energy Generation & Financials")
        c.setFont("Helvetica", 12)
        y_pos -= 20
        c.drawString(50, y_pos, f"Estimated Annual Generation: {pred.annual_generation_kwh} kWh")
        y_pos -= 20
        c.drawString(50, y_pos, f"Estimated Annual Savings: ${pred.annual_savings}")
        y_pos -= 20
        c.drawString(50, y_pos, f"Estimated Installation Cost: ${pred.installation_cost}")
        y_pos -= 20
        c.drawString(50, y_pos, f"Payback Period: {pred.payback_period_years} years")
        y_pos -= 20
        c.drawString(50, y_pos, f"25-Year Savings: ${pred.savings_25_years}")

    c.save()
    
    # Save to Report model
    report, created = Report.objects.get_or_create(project=project)
    report.report_pdf.name = f"reports/{filename}"
    report.save()
    
    return report
