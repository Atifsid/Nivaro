import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { listCategories, type Category } from '@/db/categories';
import { useDb } from '@/db/DbProvider';
import {
  addTransaction,
  getTransaction,
  softDeleteTransaction,
  updateTransaction,
  type Direction,
} from '@/db/transactions';
import { shortDate } from '@/features/home/format';
import { validateTxForm } from '@/features/transactions/validate';
import { colors, space, type } from '@/theme/tokens';
import { useFont } from '@/theme/useFont';
import { Field } from '@/ui/Field';
import { Label, Title } from '@/ui/Label';
import { PopButton } from '@/ui/PopButton';
import { Screen } from '@/ui/Screen';
import { useSubmitGuard } from '@/ui/useSubmitGuard';

const DAY = 86_400_000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function EditTransaction() {
  const { t, i18n } = useTranslation();
  const font = useFont('bold');
  const db = useDb();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<Direction>('debit');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [occurredAt, setOccurredAt] = useState(Date.now());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; merchant?: string }>({});
  const { run, busy } = useSubmitGuard();

  useEffect(() => {
    listCategories(db).then(setCategories);
    if (!id) return;
    getTransaction(db, id).then((tx) => {
      if (!tx) return;
      setAmount(String(tx.amountPaise / 100));
      setDirection(tx.direction);
      setMerchant(tx.merchant);
      setCategoryId(tx.categoryId);
      setOccurredAt(tx.occurredAt);
      setNote(tx.note ?? '');
    });
  }, [db, id]);

  const shown = categories.filter((c) => (direction === 'credit' ? c.bucket === 'income' : c.bucket !== 'income'));
  const isToday = startOfDay(occurredAt) === startOfDay(Date.now());

  const shiftDay = (days: number) => {
    const next = occurredAt + days * DAY;
    if (next <= Date.now()) setOccurredAt(next);
  };

  const save = () =>
    run(async () => {
      const result = validateTxForm({ amount, merchant });
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      const fields = {
        amountPaise: result.amountPaise,
        direction,
        merchant: result.merchant,
        categoryId,
        note: note.trim() || null,
        occurredAt,
      };
      if (id) await updateTransaction(db, id, fields);
      else await addTransaction(db, { ...fields, source: 'manual' });
      router.back();
    });

  const remove = () => {
    if (!id) return;
    Alert.alert(t('tx.deleteConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () =>
          run(async () => {
            await softDeleteTransaction(db, id);
            router.back();
          }),
      },
    ]);
  };

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <PopButton label={t('common.save')} onPress={save} disabled={busy} />
          {id ? <PopButton label={t('common.delete')} variant="secondary" onPress={remove} disabled={busy} /> : null}
        </View>
      }>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          onPress={() => router.back()}
          hitSlop={12}>
          <Text style={[styles.close, { fontFamily: font }]}>✕</Text>
        </Pressable>
        <Title>{id ? t('tx.editTitle') : t('tx.newTitle')}</Title>
      </View>

      <View style={styles.toggle}>
        {(['debit', 'credit'] as const).map((d) => (
          <Pressable
            key={d}
            accessibilityRole="button"
            accessibilityState={{ selected: direction === d }}
            onPress={() => {
              setDirection(d);
              setCategoryId(null);
            }}
            style={[styles.toggleItem, direction === d && styles.toggleActive]}>
            <Text style={[styles.toggleText, { fontFamily: font }, direction === d && styles.toggleTextActive]}>
              {t(`tx.${d}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Field
        label={t('tx.amount')}
        prefix="₹"
        numeric
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          setErrors((e) => ({ ...e, amount: undefined }));
        }}
        error={errors.amount ? t(errors.amount) : null}
        placeholder="0"
        autoFocus={!id}
      />
      <Field
        label={t('tx.merchant')}
        value={merchant}
        onChangeText={(v) => {
          setMerchant(v);
          setErrors((e) => ({ ...e, merchant: undefined }));
        }}
        error={errors.merchant ? t(errors.merchant) : null}
        placeholder={t('tx.merchantPlaceholder')}
        autoCapitalize="words"
      />

      <View style={styles.section}>
        <Label>{t('tx.category')}</Label>
        <View style={styles.chips}>
          {shown.map((c) => {
            const active = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategoryId(active ? null : c.id)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, { fontFamily: font }, active && styles.chipTextActive]}>
                  {c.icon} {t(c.nameKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Label>{t('tx.date')}</Label>
        <View style={styles.dateRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="-1"
            onPress={() => shiftDay(-1)}
            style={styles.dateBtn}>
            <Text style={[styles.dateArrow, { fontFamily: font }]}>‹</Text>
          </Pressable>
          <Text style={[styles.dateText, { fontFamily: font }]}>
            {isToday ? t('tx.today') : shortDate(occurredAt, i18n.language)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="+1"
            accessibilityState={{ disabled: isToday }}
            onPress={() => shiftDay(1)}
            style={[styles.dateBtn, isToday && styles.dim]}>
            <Text style={[styles.dateArrow, { fontFamily: font }]}>›</Text>
          </Pressable>
        </View>
      </View>

      <Field label={t('tx.note')} value={note} onChangeText={setNote} multiline style={styles.note} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  close: { ...type.title, color: colors.textMuted },
  footer: { gap: space.sm },
  toggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  toggleItem: { flex: 1, paddingVertical: space.md, alignItems: 'center' },
  toggleActive: { backgroundColor: colors.text },
  toggleText: { ...type.body, color: colors.textMuted },
  toggleTextActive: { color: colors.bg },
  section: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...type.small, color: colors.text },
  chipTextActive: { color: colors.onAccent },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  dateBtn: { paddingHorizontal: space.lg, paddingVertical: space.md },
  dateArrow: { ...type.title, color: colors.accent },
  dateText: { ...type.body, color: colors.text, flex: 1, textAlign: 'center' },
  dim: { opacity: 0.3 },
  note: { minHeight: 64, fontSize: 15 },
});
