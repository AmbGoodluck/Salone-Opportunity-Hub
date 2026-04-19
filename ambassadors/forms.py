from django import forms
from .models import Ambassador
import re


class AmbassadorApplicationForm(forms.ModelForm):
    class Meta:
        model = Ambassador
        fields = ['name', 'city', 'region', 'phone', 'email', 'bio']
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 3}),
        }

    def clean_phone(self):
        phone = self.cleaned_data['phone']
        if not re.match(r'^[+]?\d[\d\s\-]{6,19}$', phone):
            raise forms.ValidationError("Enter a valid phone number.")
        return phone

    def clean_email(self):
        email = self.cleaned_data['email']
        if Ambassador.objects.filter(email=email).exists():
            raise forms.ValidationError("This email has already been used for an application.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        phone = cleaned_data.get('phone')
        if phone and Ambassador.objects.filter(phone=phone).exists():
            self.add_error('phone', "This phone number has already been used for an application.")
        return cleaned_data
