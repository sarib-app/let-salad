import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, Fonts, Spacing } from '../../utils/globalStyles';
import { useLanguage } from '../../context/LanguageContext';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Paragraph = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const Bullet = ({ children }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const PrivacyPolicyScreen = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (isAr) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>آخر تحديث: أبريل 2026</Text>

        <Section title="1. المعلومات التي نجمعها">
          <Bullet>الاسم ورقم الهاتف والبريد الإلكتروني عند التسجيل.</Bullet>
          <Bullet>عنوان التوصيل وبيانات الموقع الجغرافي.</Bullet>
          <Bullet>التفضيلات الغذائية والمعلومات الصحية (العمر، الوزن، الطول، الجنس).</Bullet>
          <Bullet>بيانات الدفع (لا نخزن أرقام البطاقات مباشرةً).</Bullet>
          <Bullet>بيانات استخدام التطبيق وسجل الطلبات.</Bullet>
        </Section>

        <Section title="2. كيف نستخدم معلوماتك">
          <Bullet>معالجة طلباتك وتنسيق عمليات التوصيل.</Bullet>
          <Bullet>تخصيص خطط الوجبات حسب تفضيلاتك.</Bullet>
          <Bullet>إرسال إشعارات تتعلق بطلباتك واشتراكك.</Bullet>
          <Bullet>تحسين خدماتنا وتجربة المستخدم.</Bullet>
          <Bullet>الامتثال للمتطلبات القانونية والتنظيمية.</Bullet>
        </Section>

        <Section title="3. مشاركة المعلومات">
          <Paragraph>
            لا نبيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك بياناتك مع شركاء الخدمة (التوصيل، معالجة المدفوعات) لتنفيذ طلباتك فقط.
          </Paragraph>
        </Section>

        <Section title="4. الاحتفاظ بالبيانات">
          <Paragraph>
            نحتفظ ببياناتك طالما حسابك نشط أو حسب الحاجة لتقديم الخدمة. يمكنك طلب حذف حسابك وبياناتك في أي وقت من خلال الإعدادات.
          </Paragraph>
        </Section>

        <Section title="5. الأمان">
          <Paragraph>
            نطبق تدابير أمنية تقنية وتنظيمية لحماية بياناتك، بما في ذلك التشفير وبروتوكولات الوصول الآمن.
          </Paragraph>
        </Section>

        <Section title="6. حقوقك">
          <Bullet>الوصول إلى بياناتك الشخصية وتصحيحها.</Bullet>
          <Bullet>طلب حذف بياناتك.</Bullet>
          <Bullet>الاعتراض على معالجة بياناتك.</Bullet>
          <Bullet>سحب موافقتك في أي وقت.</Bullet>
        </Section>

        <Section title="7. التواصل معنا">
          <Paragraph>لممارسة حقوقك أو للاستفسار، تواصل معنا على: support@letsalad.com</Paragraph>
        </Section>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lastUpdated}>Last updated: April 2026</Text>

      <Paragraph>
        At Let'Salad, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our app.
      </Paragraph>

      <Section title="1. Information We Collect">
        <Bullet>Name, phone number, and email address upon registration.</Bullet>
        <Bullet>Delivery address and location data.</Bullet>
        <Bullet>Dietary preferences and health information (age, weight, height, sex).</Bullet>
        <Bullet>Payment information (we do not store full card numbers directly).</Bullet>
        <Bullet>App usage data and order history.</Bullet>
        <Bullet>Device information and push notification tokens.</Bullet>
      </Section>

      <Section title="2. How We Use Your Information">
        <Bullet>To process your orders and coordinate deliveries.</Bullet>
        <Bullet>To personalise meal plans based on your preferences and goals.</Bullet>
        <Bullet>To send order confirmations, delivery updates, and subscription reminders.</Bullet>
        <Bullet>To improve our services and app experience.</Bullet>
        <Bullet>To comply with legal and regulatory requirements.</Bullet>
        <Bullet>To respond to your support requests.</Bullet>
      </Section>

      <Section title="3. Sharing Your Information">
        <Paragraph>
          We do not sell your personal data to third parties. We may share your information with trusted service partners (delivery providers, payment processors) solely to fulfil your orders. All partners are contractually obligated to protect your data.
        </Paragraph>
      </Section>

      <Section title="4. Payment Data">
        <Paragraph>
          Payment transactions are processed securely by Moyasar and Apple Pay. We do not store your full card details. Payment references are stored only to verify transaction status.
        </Paragraph>
      </Section>

      <Section title="5. Data Retention">
        <Paragraph>
          We retain your personal data for as long as your account is active or as needed to provide the service. You may request deletion of your account and associated data at any time through the app settings. Some data may be retained for legal compliance purposes.
        </Paragraph>
      </Section>

      <Section title="6. Security">
        <Paragraph>
          We implement appropriate technical and organisational measures to protect your data, including encryption in transit (HTTPS), secure access controls, and regular security reviews. However, no method of transmission over the internet is 100% secure.
        </Paragraph>
      </Section>

      <Section title="7. Your Rights">
        <Bullet>Access and correct your personal information.</Bullet>
        <Bullet>Request deletion of your personal data.</Bullet>
        <Bullet>Object to or restrict processing of your data.</Bullet>
        <Bullet>Withdraw consent at any time.</Bullet>
        <Bullet>Receive a copy of your data in a portable format.</Bullet>
      </Section>

      <Section title="8. Children's Privacy">
        <Paragraph>
          Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with their data, please contact us immediately.
        </Paragraph>
      </Section>

      <Section title="9. Changes to This Policy">
        <Paragraph>
          We may update this Privacy Policy periodically. We will notify you of significant changes via the app or email. Continued use of the app after changes are posted constitutes acceptance of the revised policy.
        </Paragraph>
      </Section>

      <Section title="10. Contact Us">
        <Paragraph>
          For any privacy-related questions or to exercise your rights, contact us at: support@letsalad.com
        </Paragraph>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  lastUpdated: {
    ...Fonts.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Fonts.bold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: Spacing.md,
  },
  bullet: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    ...Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
});

export default PrivacyPolicyScreen;
