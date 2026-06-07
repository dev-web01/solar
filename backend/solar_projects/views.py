from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, UploadedImage
from .serializers import ProjectSerializer, UploadedImageSerializer

# We will import the AI processor here later
# from .ai_processor import analyze_project

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        project = self.get_object()
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_image = UploadedImage.objects.create(project=project, image=image_file)
        serializer = UploadedImageSerializer(uploaded_image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        project = self.get_object()
        from .ai_processor import analyze_project
        try:
            analyze_project(project)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        project.refresh_from_db()
        serializer = self.get_serializer(project)
        return Response(serializer.data)
