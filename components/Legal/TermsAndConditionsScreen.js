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

const TermsAndConditionsScreen = () => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  if (isAr) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>آخر تحديث: أبريل 2026</Text>

        <Section title="1. القبول بالشروط">
          <Paragraph>
            باستخدامك لتطبيق Let'Salad، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يرجى عدم استخدام التطبيق.
          </Paragraph>
        </Section>

        <Section title="2. وصف الخدمة">
          <Paragraph>
            تقدم Let'Salad خدمة اشتراك لتوصيل وجبات صحية مصممة حسب تفضيلاتك الغذائية، وتُسلَّم مباشرةً إلى عنوانك في المملكة العربية السعودية.
          </Paragraph>
        </Section>

        <Section title="3. الاشتراكات والمدفوعات">
          <Bullet>تُدفع رسوم الاشتراك مقدماً عند الاشتراك.</Bullet>
          <Bullet>جميع الأسعار بالريال السعودي (SAR) وتشمل ضريبة القيمة المضافة (15%).</Bullet>
          <Bullet>رسوم التوصيل تُحسب بناءً على منطقتك الجغرافية.</Bullet>
          <Bullet>لا يمكن استرداد المبالغ المدفوعة بعد بدء فترة الاشتراك.</Bullet>
          <Bullet>نحتفظ بحق تعديل الأسعار مع إشعار مسبق.</Bullet>
        </Section>

        <Section title="4. التوصيل">
          <Bullet>نوصل داخل مناطق التوصيل المحددة فقط.</Bullet>
          <Bullet>يُحدد موعد التوصيل خلال النافذة الزمنية المختارة.</Bullet>
          <Bullet>نحن غير مسؤولين عن التأخير الناجم عن ظروف خارجة عن إرادتنا.</Bullet>
          <Bullet>في حال عدم وجودك عند التوصيل، قد تُعتبر الطلبية قد سُلِّمت.</Bullet>
        </Section>

        <Section title="5. اختيار الوجبات">
          <Paragraph>
            يجب تحديد الوجبات قبل الموعد المحدد لكل يوم توصيل. التغييرات بعد الموعد النهائي غير مضمونة.
          </Paragraph>
        </Section>

        <Section title="6. تجميد الاشتراك وإلغاؤه">
          <Bullet>يمكنك تجميد اشتراكك لمدة لا تتجاوز 14 يوماً خلال فترة الاشتراك.</Bullet>
          <Bullet>يمكن إلغاء الاشتراك قبل بدء دورة الفوترة التالية.</Bullet>
          <Bullet>الاشتراكات الجارية غير قابلة للإلغاء مع استرداد المبلغ.</Bullet>
        </Section>

        <Section title="7. سلامة الغذاء والحساسية">
          <Paragraph>
            نلتزم بأعلى معايير سلامة الغذاء. إذا كنت تعاني من حساسية غذائية، يرجى إخطارنا مسبقاً. لا نضمن خلو وجباتنا من مسببات الحساسية.
          </Paragraph>
        </Section>

        <Section title="8. حساب المستخدم">
          <Bullet>أنت مسؤول عن الحفاظ على سرية بيانات حسابك.</Bullet>
          <Bullet>يجب أن تكون عمرك 18 عاماً أو أكثر لاستخدام التطبيق.</Bullet>
          <Bullet>نحتفظ بحق تعليق أو إنهاء حسابك في حال مخالفة هذه الشروط.</Bullet>
        </Section>

        <Section title="9. القانون المطبق">
          <Paragraph>
            تخضع هذه الشروط لقوانين المملكة العربية السعودية وتُفسر وفقاً لها.
          </Paragraph>
        </Section>

        <Section title="10. التواصل معنا">
          <Paragraph>لأي استفسارات، تواصل معنا على: support@letsalad.com</Paragraph>
        </Section>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lastUpdated}>Last updated: April 2026</Text>

      <Section title="1. Acceptance of Terms">
        <Paragraph>
          By using the Let'Salad app, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, please do not use the app.
        </Paragraph>
      </Section>

      <Section title="2. Description of Service">
        <Paragraph>
          Let'Salad provides a meal subscription and delivery service offering healthy, customised meals delivered directly to your address in Saudi Arabia. Meals are prepared fresh and delivered according to your chosen subscription plan.
        </Paragraph>
      </Section>

      <Section title="3. Subscriptions & Payments">
        <Bullet>Subscription fees are charged upfront at the time of purchase.</Bullet>
        <Bullet>All prices are in Saudi Riyals (SAR) and include 15% VAT.</Bullet>
        <Bullet>Delivery charges are calculated based on your delivery zone.</Bullet>
        <Bullet>Payments are non-refundable once a subscription period has commenced.</Bullet>
        <Bullet>We accept Visa, Mastercard, Mada, and Apple Pay.</Bullet>
        <Bullet>We reserve the right to modify pricing with prior notice.</Bullet>
      </Section>

      <Section title="4. Delivery">
        <Bullet>We deliver within designated delivery zones only.</Bullet>
        <Bullet>Delivery is made during the time window selected at checkout.</Bullet>
        <Bullet>We are not liable for delays caused by circumstances beyond our control.</Bullet>
        <Bullet>If you are unavailable at the time of delivery, the order may be considered delivered and left at the door.</Bullet>
        <Bullet>Delivery address changes must be made before the cut-off time for the relevant delivery day.</Bullet>
      </Section>

      <Section title="5. Meal Selection">
        <Paragraph>
          Meals must be selected before the daily cut-off time for each delivery day. Changes after the cut-off time cannot be guaranteed. If no selection is made, a default meal may be assigned.
        </Paragraph>
      </Section>

      <Section title="6. Pausing & Cancellation">
        <Bullet>You may pause your subscription for up to 14 days within a subscription period.</Bullet>
        <Bullet>Subscriptions can be cancelled before the next billing cycle begins.</Bullet>
        <Bullet>Active subscription periods are non-refundable upon cancellation.</Bullet>
        <Bullet>Unused days due to cancellation will not be refunded or credited.</Bullet>
      </Section>

      <Section title="7. Food Safety & Allergens">
        <Paragraph>
          We follow the highest food safety standards. If you have any food allergies or dietary restrictions, please notify us before subscribing. While we take every precaution, we cannot guarantee that our meals are completely free from allergens. Let'Salad is not liable for allergic reactions resulting from undisclosed allergen information.
        </Paragraph>
      </Section>

      <Section title="8. User Account">
        <Bullet>You are responsible for maintaining the confidentiality of your account credentials.</Bullet>
        <Bullet>You must be 18 years of age or older to use this app.</Bullet>
        <Bullet>You are responsible for all activity that occurs under your account.</Bullet>
        <Bullet>We reserve the right to suspend or terminate your account for violations of these terms.</Bullet>
      </Section>

      <Section title="9. Intellectual Property">
        <Paragraph>
          All content within the Let'Salad app, including logos, images, text, and design, is the property of Let'Salad and is protected by applicable intellectual property laws. You may not reproduce or distribute any content without our written permission.
        </Paragraph>
      </Section>

      <Section title="10. Limitation of Liability">
        <Paragraph>
          To the maximum extent permitted by law, Let'Salad shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for your current subscription.
        </Paragraph>
      </Section>

      <Section title="11. Changes to Terms">
        <Paragraph>
          We may update these Terms and Conditions from time to time. Continued use of the app after changes are posted constitutes acceptance of the revised terms. We will notify you of significant changes via the app or email.
        </Paragraph>
      </Section>

      <Section title="12. Governing Law">
        <Paragraph>
          These Terms are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.
        </Paragraph>
      </Section>

      <Section title="13. Contact Us">
        <Paragraph>For any questions regarding these Terms, please contact us at: support@letsalad.com</Paragraph>
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

export default TermsAndConditionsScreen;
