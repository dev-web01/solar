from rest_framework import serializers
from .models import Project, UploadedImage, AnalysisResult, EnergyPrediction, Report

class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ['id', 'image', 'uploaded_at']

class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = '__all__'

class EnergyPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyPrediction
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    images = UploadedImageSerializer(many=True, read_only=True)
    analysis = AnalysisResultSerializer(read_only=True)
    prediction = EnergyPredictionSerializer(read_only=True)
    report = ReportSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'location', 'roof_length', 'roof_width', 
            'roof_pitch', 'roof_azimuth', 'panel_type',
            'monthly_electricity_bill', 'created_at', 
            'images', 'analysis', 'prediction', 'report'
        ]
