import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { MAJOR_ARCANA, guestCardForToday, randomDraw } from '@/lib/tarot';
import { colors } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { getTodayDraw, saveTodayDraw } from '@/services/api';
import { Txt } from './Txt';
import { Card } from './ui';
import { TarotCardFlip } from './TarotCardFlip';
import { Button } from './Button';

/**
 * ШИНЭЛЭГ БОЛОМЖ: «Өдрийн хөзөр»
 * Өдөрт нэг удаа хөзөр эргүүлнэ. Нэвтэрсэн хэрэглэгчийн сугалаа daily_draws
 * хүснэгтэд (user_id + огноо = primary key) хадгалагдана → дахин эргүүлж болохгүй.
 */
export function DailyCard() {
  const { session } = useAuth();
  const [draw, setDraw] = useState<{ cardId: number; reversed: boolean } | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    if (!session) {
      setDraw(guestCardForToday());
      return;
    }
    getTodayDraw(session.user.id)
      .then((d) => {
        if (d) {
          setDraw({ cardId: d.card_id, reversed: d.reversed });
          setRevealed(true);
        } else setDraw(null);
      })
      .catch(() => setDraw(null));
  }, [session]);

  async function reveal() {
    let d = draw;
    if (session && !d) {
      d = randomDraw();
      setDraw(d);
      saveTodayDraw(session.user.id, d.cardId, d.reversed).catch(() => {});
    }
    setRevealed(true);
  }

  const card = draw ? MAJOR_ARCANA[draw.cardId] : null;

  return (
    <Card style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
      <TarotCardFlip card={card} reversed={draw?.reversed} revealed={revealed} onPress={reveal} width={104} />
      <View style={{ flex: 1, gap: 6 }}>
        <Txt variant="overline">ӨДРИЙН ХӨЗӨР</Txt>
        {revealed && card ? (
          <>
            <Txt variant="h2">{card.name}</Txt>
            {draw?.reversed ? <Txt variant="small" style={{ color: colors.warning }}>Урвуу буусан</Txt> : null}
            <Txt variant="muted">{draw?.reversed ? card.reversed : card.upright}</Txt>
            <Button title="Таротчноос асуух" kind="soft" size="sm" onPress={() => router.push('/readers')} style={{ marginTop: 4 }} />
          </>
        ) : (
          <>
            <Txt variant="h3">Өнөөдөр танд ямар зурвас ирэх бол?</Txt>
            <Txt variant="muted">Хөзөр дээр дарж эргүүлээрэй. Өдөрт ганц удаа.</Txt>
          </>
        )}
      </View>
    </Card>
  );
}
