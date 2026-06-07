from django.db import models
from django.utils import timezone

class Project(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    roof_length = models.FloatField(help_text="Length in meters")
    roof_width = models.FloatField(help_text="Width in meters")
    roof_pitch = models.FloatField(default=20.0, help_text="Roof pitch/angle in degrees")
    roof_azimuth = models.CharField(max_length=50, default="South", help_text="Direction roof faces")
    panel_type = models.CharField(max_length=50, default="Standard", help_text="Standard, Premium, Ultra")
    monthly_electricity_bill = models.FloatField(help_text="Monthly bill in local currency")
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

class UploadedImage(models.Model):
    project = models.ForeignKey(Project, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='project_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class AnalysisResult(models.Model):
    project = models.OneToOneField(Project, related_name='analysis', on_delete=models.CASCADE)
    solar_score = models.FloatField(default=0.0, help_text="0-10 Score")
    confidence_score = models.FloatField(default=0.0, help_text="Percentage")
    usable_rooftop_area = models.FloatField(default=0.0, help_text="Square meters")
    suitable_zones = models.IntegerField(default=0)
    unsuitable_zones = models.IntegerField(default=0)
    light_intensity_percentage = models.FloatField(default=0.0)
    shadow_coverage_percentage = models.FloatField(default=0.0)
    obstacle_data = models.JSONField(default=dict, help_text="JSON mapping of detected obstacles")
    recommended_panel_orientation = models.CharField(max_length=100, default="South")
    recommended_system_size_kw = models.FloatField(default=0.0)
    processed_at = models.DateTimeField(auto_now_add=True)

class EnergyPrediction(models.Model):
    project = models.OneToOneField(Project, related_name='prediction', on_delete=models.CASCADE)
    daily_generation_kwh = models.FloatField(default=0.0)
    monthly_generation_kwh = models.FloatField(default=0.0)
    annual_generation_kwh = models.FloatField(default=0.0)
    panels_required = models.IntegerField(default=0)
    installation_cost = models.FloatField(default=0.0)
    annual_savings = models.FloatField(default=0.0)
    payback_period_years = models.FloatField(default=0.0)
    savings_10_years = models.FloatField(default=0.0)
    savings_25_years = models.FloatField(default=0.0)
    calculated_at = models.DateTimeField(auto_now_add=True)

class Report(models.Model):
    project = models.OneToOneField(Project, related_name='report', on_delete=models.CASCADE)
    report_pdf = models.FileField(upload_to='reports/', null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
