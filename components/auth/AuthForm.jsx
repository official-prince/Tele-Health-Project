@@ .. @@
     phone: '',
     dateOfBirth: '',
     gender: ''
+    role: 'patient'
   })
   const [errors, setErrors] = useState({})

@@ .. @@
       if (!formData.lastName) newErrors.lastName = 'Last name is required'
       if (!formData.phone) newErrors.phone = 'Phone number is required'
       if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
       if (!formData.gender) newErrors.gender = 'Gender is required'
       if (formData.password !== formData.confirmPassword) {
@@ .. @@
         localStorage.setItem('telehealth_user', JSON.stringify({
           email: formData.email,
           firstName: formData.firstName,
           lastName: formData.lastName,
           phone: formData.phone,
           dateOfBirth: formData.dateOfBirth,
           gender: formData.gender,
+          role: formData.role,
           id: Date.now().toString()
         }))
       }
       onAuthSuccess({
         email: formData.email,
         firstName: formData.firstName || formData.email.split('@')[0],
-        lastName: formData.lastName || ''
+        lastName: formData.lastName || '',
+        role: formData.role
       })
     }, 1500)
   }