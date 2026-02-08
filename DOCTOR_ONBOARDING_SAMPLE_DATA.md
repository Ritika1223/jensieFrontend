# Doctor Onboarding - Sample Data

Use this sample data to test the doctor onboarding form.

## Sample Doctor 1 - Cardiologist

```json
{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@jensei.com",
  "specialty": "Cardiologist",
  "gender": "female",
  "experience": 12,
  "patientStories": 1250,
  "rating": 4.8,
  "location": "Mumbai, Maharashtra",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "image": "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-1.png",
  "badge": "Top Rated",
  "fee": 1500,
  "biography": "Dr. Sarah Johnson is a renowned cardiologist with over 12 years of experience in treating cardiovascular diseases. She specializes in interventional cardiology and has successfully performed over 2000 cardiac procedures.",
  "specialization": ["Interventional Cardiology", "Heart Failure", "Cardiac Rehabilitation"],
  "qualifications": "MBBS, MD (Cardiology), DM (Cardiology), FACC",
  "totalConsultations": 3500,
  "officeAddress": "123 Medical Center, Bandra West, Mumbai - 400050",
  "phoneNumber": "+91 9876543210",
  "officePhoneNumber": "+91 22 12345678"
}
```

## Sample Doctor 2 - Neurologist

```json
{
  "name": "Dr. Rajesh Kumar",
  "email": "rajesh.kumar@jensei.com",
  "specialty": "Neurologist",
  "gender": "male",
  "experience": 15,
  "patientStories": 2100,
  "rating": 4.9,
  "location": "Delhi, NCR",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "image": "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-2.png",
  "badge": "Recommended",
  "fee": 2000,
  "biography": "Dr. Rajesh Kumar is a leading neurologist specializing in stroke management, epilepsy, and movement disorders. With 15 years of experience, he has treated thousands of patients with neurological conditions.",
  "specialization": ["Stroke Management", "Epilepsy", "Movement Disorders", "Headache Management"],
  "qualifications": "MBBS, MD (Medicine), DM (Neurology), FIAN",
  "totalConsultations": 4200,
  "officeAddress": "456 Neurology Clinic, Connaught Place, New Delhi - 110001",
  "phoneNumber": "+91 9876543211",
  "officePhoneNumber": "+91 11 23456789"
}
```

## Sample Doctor 3 - Pediatrician

```json
{
  "name": "Dr. Priya Sharma",
  "email": "priya.sharma@jensei.com",
  "specialty": "Pediatrician",
  "gender": "female",
  "experience": 8,
  "patientStories": 890,
  "rating": 4.7,
  "location": "Bangalore, Karnataka",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "image": "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-3.png",
  "badge": "",
  "fee": 800,
  "biography": "Dr. Priya Sharma is a dedicated pediatrician with expertise in child development, vaccination, and common childhood illnesses. She is known for her compassionate approach towards children and their families.",
  "specialization": ["Child Development", "Vaccination", "Pediatric Nutrition", "Newborn Care"],
  "qualifications": "MBBS, MD (Pediatrics), DNB (Pediatrics)",
  "totalConsultations": 1800,
  "officeAddress": "789 Children's Hospital, Koramangala, Bangalore - 560095",
  "phoneNumber": "+91 9876543212",
  "officePhoneNumber": "+91 80 34567890"
}
```

## Sample Doctor 4 - Orthopedic Surgeon

```json
{
  "name": "Dr. Amit Patel",
  "email": "amit.patel@jensei.com",
  "specialty": "Orthopedic Surgeon",
  "gender": "male",
  "experience": 18,
  "patientStories": 3200,
  "rating": 4.9,
  "location": "Pune, Maharashtra",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "image": "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-4.png",
  "badge": "Top Rated",
  "fee": 2500,
  "biography": "Dr. Amit Patel is a highly experienced orthopedic surgeon specializing in joint replacement, sports medicine, and trauma surgery. He has performed over 5000 successful surgeries.",
  "specialization": ["Joint Replacement", "Sports Medicine", "Trauma Surgery", "Arthroscopy"],
  "qualifications": "MBBS, MS (Orthopedics), MCh (Orthopedics), FACS",
  "totalConsultations": 5500,
  "officeAddress": "321 Orthopedic Center, Koregaon Park, Pune - 411001",
  "phoneNumber": "+91 9876543213",
  "officePhoneNumber": "+91 20 45678901"
}
```

## Sample Doctor 5 - Dermatologist

```json
{
  "name": "Dr. Ananya Reddy",
  "email": "ananya.reddy@jensei.com",
  "specialty": "Dermatologist",
  "gender": "female",
  "experience": 10,
  "patientStories": 1650,
  "rating": 4.6,
  "location": "Hyderabad, Telangana",
  "latitude": 17.3850,
  "longitude": 78.4867,
  "image": "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-5.png",
  "badge": "Recommended",
  "fee": 1200,
  "biography": "Dr. Ananya Reddy is a skilled dermatologist specializing in cosmetic dermatology, acne treatment, and skin cancer detection. She combines medical expertise with aesthetic treatments.",
  "specialization": ["Cosmetic Dermatology", "Acne Treatment", "Skin Cancer", "Hair Disorders"],
  "qualifications": "MBBS, MD (Dermatology), DNB (Dermatology), IADVL",
  "totalConsultations": 2800,
  "officeAddress": "654 Skin Care Clinic, Banjara Hills, Hyderabad - 500034",
  "phoneNumber": "+91 9876543214",
  "officePhoneNumber": "+91 40 56789012"
}
```

## Quick Fill Guide

### Required Fields (marked with *):
- **Name**: Doctor's full name
- **Specialty**: Medical specialty (e.g., Cardiologist, Neurologist)
- **Gender**: male, female, or others
- **Experience**: Number of years (e.g., 10)
- **Rating**: Between 0 and 5 (e.g., 4.8)
- **Location**: City and state (e.g., "Mumbai, Maharashtra")
- **Latitude**: Decimal coordinate (e.g., 19.0760)
- **Longitude**: Decimal coordinate (e.g., 72.8777)
- **Image**: S3 URL (e.g., "https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-1.png")
- **Fee**: Consultation fee in rupees (e.g., 1500)

### Optional Fields:
- **Email**: Doctor's email address
- **Patient Stories**: Number of patient stories (defaults to 0)
- **Badge**: "Recommended" or "Top Rated" or leave empty
- **Biography**: Doctor's professional background
- **Specialization**: Array of specializations (add multiple)
- **Qualifications**: Medical degrees and certifications
- **Total Consultations**: Total number of consultations
- **Office Address**: Physical address of clinic
- **Phone Number**: Personal contact number
- **Office Phone Number**: Clinic contact number

## Notes

- After successful creation, a popup will appear with:
  - Doctor Profile URL (copyable)
  - "View Profile" button (navigates to doctor profile)
  - "Go to Doctors List" button (navigates to doctors listing)
- The popup can be closed by clicking the X button or outside the popup
- All form fields will be reset after successful creation

