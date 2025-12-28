export const translations = {
  en: {
    onboarding: {
      title1: 'Fresh & Healthy Meals',
      subtitle1: 'Get delicious, nutritious meals delivered to your doorstep daily',
      title2: 'Flexible Subscriptions',
      subtitle2: 'Choose from various meal plans that fit your lifestyle',
      title3: 'Track Your Orders',
      subtitle3: 'Real-time tracking of your meal preparation and delivery',
      skip: 'Skip',
      next: 'Next',
      getStarted: 'Get Started',
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      phoneNumber: 'Phone Number',
      enterPhone: 'Enter your phone number',
      password: 'Password',
      enterPassword: 'Enter your password',
      forgotPassword: 'Forgot Password?',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      or: 'OR',
      fullName: 'Full Name',
      enterName: 'Enter your full name',
      email: 'Email',
      enterEmail: 'Enter your email',
      confirmPassword: 'Confirm Password',
      agreeTerms: 'I agree to Terms & Conditions',
    },
    common: {
      continue: 'Continue',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
    },
  },
  ar: {
    onboarding: {
      title1: 'وجبات طازجة وصحية',
      subtitle1: 'احصل على وجبات لذيذة ومغذية يتم توصيلها إلى باب منزلك يوميًا',
      title2: 'اشتراكات مرنة',
      subtitle2: 'اختر من بين خطط الوجبات المختلفة التي تناسب نمط حياتك',
      title3: 'تتبع طلباتك',
      subtitle3: 'تتبع في الوقت الفعلي لتحضير وتوصيل وجبتك',
      skip: 'تخطي',
      next: 'التالي',
      getStarted: 'ابدأ الآن',
    },
    auth: {
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      phoneNumber: 'رقم الهاتف',
      enterPhone: 'أدخل رقم هاتفك',
      password: 'كلمة المرور',
      enterPassword: 'أدخل كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      continueWithGoogle: 'متابعة مع جوجل',
      continueWithApple: 'متابعة مع أبل',
      or: 'أو',
      fullName: 'الاسم الكامل',
      enterName: 'أدخل اسمك الكامل',
      email: 'البريد الإلكتروني',
      enterEmail: 'أدخل بريدك الإلكتروني',
      confirmPassword: 'تأكيد كلمة المرور',
      agreeTerms: 'أوافق على الشروط والأحكام',
    },
    common: {
      continue: 'متابعة',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      loading: 'جاري التحميل...',
    },
  },
};

let currentLanguage = 'en';

export const setLanguage = (lang) => {
  currentLanguage = lang;
};

export const getLanguage = () => currentLanguage;

export const t = (key) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
};
