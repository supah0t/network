from django import forms
from .models import Comment

class Comment_Form(forms.ModelForm):
    class Meta:
        model = Comment
        fields = [
            'comment'
        ]
        widgets = {
            'comment': forms.Textarea(attrs={'class': 'form-control', 'rows': 3})
        }
        labels = {
            'comment': ""
        }