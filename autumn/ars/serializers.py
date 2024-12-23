from rest_framework import serializers
from .models import User, Role, UserRole, Team, Assignment, SubTask, Submission, Review, Comment, Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.hashers import check_password 
from django.contrib.auth import authenticate 

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
   
        username = attrs.get('username')
        password = attrs.get('password')

       
        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError('Invalid credentials')  # If authentication fails

        
        return super().validate(attrs)



class UserSerializer(serializers.ModelSerializer):
  

    class Meta:
        model = User  
        fields = ['id', 'username', 'email', 'first_name', 'last_name','password']

    def create(self, validated_data):
        user = User(**validated_data)  
        user.set_password(validated_data['password'])  
        user.save()  
        return user


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'role_name']



class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['user', 'role']




class TeamSerializer(serializers.ModelSerializer):
    members = serializers.ListField(child=serializers.EmailField(), required=False)

    class Meta:
        model = Team
        fields = ['id', 'team_name', 'members']  # 'created_by' removed here

    def create(self, validated_data):
        members_emails = validated_data.pop('members', [])
        members_data = User.objects.filter(email__in=members_emails).values_list('id', flat=True)
        validated_data['members'] = list(members_data)
        
        # Get the user from the context and set it as created_by
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)




from rest_framework.exceptions import ValidationError
class AssignmentSerializer(serializers.ModelSerializer):
    reviewers = serializers.ListField(
        child=serializers.EmailField(),  # List of reviewer emails
        write_only=True
    ) 
    team = serializers.PrimaryKeyRelatedField(queryset=Team.objects.all())
    created_by = serializers.EmailField(source='created_by.email', read_only=True)  # Display creator's email

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'due_date', 'team', 'reviewers', 'created_by', 'file']

    def create(self, validated_data):
   
     reviewer_emails = validated_data.pop('reviewers', [])
     user = self.context['request'].user  
     creator_email = user.email 

 
     if creator_email not in reviewer_emails:
        reviewer_emails.append(creator_email)

   
     reviewers = User.objects.filter(email__in=reviewer_emails)
     if reviewers.count() != len(set(reviewer_emails)):
        raise serializers.ValidationError("One or more reviewer emails are invalid.")

   

     assignment = Assignment.objects.create(**validated_data, created_by=user) 
     assignment.reviewers.set(reviewers)  
     return assignment


    def update(self, instance, validated_data):
       
        reviewer_emails = validated_data.pop('reviewers', None)
        if reviewer_emails is not None:
          
            reviewers = User.objects.filter(email__in=reviewer_emails)
            if reviewers.count() != len(set(reviewer_emails)):
                raise serializers.ValidationError("One or more reviewer emails are invalid.")
            instance.reviewers.set(reviewers)  

        return super().update(instance, validated_data)

class SubTaskSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer()

    class Meta:
        model = SubTask
        fields = ['id', 'title', 'description', 'assignment']



class SubmissionSerializer(serializers.ModelSerializer):
    attachment = serializers.URLField(required=True, allow_blank=False)  # Make attachment required
    comments = serializers.CharField(required=False, allow_blank=True)  # Allow comments to be optional
    submitted_by_email = serializers.EmailField(source='submitted_by.email', read_only=True)


    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'submitted_by', 'attachment', 'comments', 'submission_date', 'submitted_by_email']
        read_only_fields = ['assignment','submitted_by', 'submission_date']  # Keep these fields read-only

    def create(self, validated_data):
        request = self.context['request']
        validated_data['submitted_by'] = request.user 
        return super().create(validated_data)



class ReviewSerializer(serializers.ModelSerializer):
     class Meta:
        model = Review
        fields = ['id', 'assignment', 'reviewer', 'iteration_number', 'comments', 'status', 'review_date']
        read_only_fields = ['reviewer', 'review_date']  # Mark reviewer and review_date as read-only if they're set automatically



# Comment Serializer
class CommentSerializer(serializers.ModelSerializer):
    review = ReviewSerializer()
    created_by = UserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'review', 'created_by', 'comment_text', 'timestamp']


# Profile Serializer
class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ['user', 'review_history', 'submission_history', 'pending_reviews', 'in_progress_assignments']

