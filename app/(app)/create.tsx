import { useRef, useState } from "react";
import { router } from "expo-router";
import {
  ScrollView,
  Pressable,
  View,
  Modal,
  Alert,
  useWindowDimensions,
} from "react-native";

import {
  MatchBackground,
  MatchBottomNav,
  SegmentedControl,
  SectionTitle,
  StepIndicator,
  useMatchTheme,
} from "@/src/components/features/matches";
import { type PitchMode } from "@/src/components/fifa";
import { Button, Screen, Text } from "@/src/components/ui";
import { BRAZIL_STATE_OPTIONS } from "@/src/features/auth/constants";
import { fetchAddressByCep, formatCep } from "@/src/features/location/cep";
import { useMatches } from "@/src/features/matches/hooks/useMatches";
import { useAppColorScheme } from "@/src/contexts/ThemeContext";
import { useTranslation } from "@/src/i18n/hooks/useTranslation";
import { CreateMatchStep1 } from "@/src/components/features/matches/create/CreateMatchStep1";
import { CreateMatchStep2 } from "@/src/components/features/matches/create/CreateMatchStep2";
import { CreateMatchStep3 } from "@/src/components/features/matches/create/CreateMatchStep3";

type MinLevelValue =
  | "resenha"
  | "casual"
  | "intermediario"
  | "avancado"
  | "competitivo"
  | "semi_amador"
  | "amador"
  | "ex_profissional";

const MIN_LEVEL_OPTIONS: Array<{ value: MinLevelValue }> = [
  { value: "resenha" },
  { value: "casual" },
  { value: "intermediario" },
  { value: "avancado" },
  { value: "competitivo" },
  { value: "semi_amador" },
  { value: "amador" },
  { value: "ex_profissional" },
];

const TURNO_OPTIONS = [
  { value: "manha" },
  { value: "tarde" },
  { value: "noite" },
] as const;

type CreateStep = "1" | "2" | "3";
type TurnoValue = (typeof TURNO_OPTIONS)[number]["value"] | "";

function formatDateField(value: Date) {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeField(value: Date) {
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toIsoTime(value: Date) {
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}:00`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function CreateMatchScreen() {
  const { t, currentLanguage } = useTranslation("create");
  const theme = useAppColorScheme();
  const matchTheme = useMatchTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { createMatch, submitting } = useMatches();
  const creatingRef = useRef(false);

  const [mode, setMode] = useState<PitchMode>("futsal");
  const [restBreak, setRestBreak] = useState(false);
  const [referee, setReferee] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedPositionIndexes, setSelectedPositionIndexes] = useState<
    number[]
  >([]);

  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [cep, setCep] = useState("");
  const [venueName, setVenueName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [matchDate, setMatchDate] = useState(() => {
    const initialDate = new Date();
    initialDate.setDate(initialDate.getDate() + 1);
    initialDate.setHours(0, 0, 0, 0);
    return initialDate;
  });
  const [matchTime, setMatchTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(19, 30, 0, 0);
    return initialTime;
  });
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [hasSelectedTime, setHasSelectedTime] = useState(false);
  const [showWebDateModal, setShowWebDateModal] = useState(false);
  const [showWebTimeModal, setShowWebTimeModal] = useState(false);
  const [webDateCursor, setWebDateCursor] = useState(
    () => new Date(matchDate.getFullYear(), matchDate.getMonth(), 1),
  );
  const [webHour, setWebHour] = useState(matchTime.getHours());
  const [webMinute, setWebMinute] = useState(matchTime.getMinutes());
  const [turno, setTurno] = useState<TurnoValue>("");
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [minAge, setMinAge] = useState(16);
  const [maxAge, setMaxAge] = useState(80);
  const [activeStep, setActiveStep] = useState<CreateStep>("1");

  const [acceptedLevels, setAcceptedLevels] = useState<MinLevelValue[]>([]);

  const stateOptions = BRAZIL_STATE_OPTIONS.map((state) => ({
    value: state.value,
    label: state.label,
    description: state.value,
  }));

  const toggleLevel = (value: MinLevelValue) => {
    setAcceptedLevels((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const togglePosition = (index: number) => {
    setSelectedPositionIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index].sort((a, b) => a - b),
    );
  };

  const goToStep = (step: CreateStep) => setActiveStep(step);

  const goToNextStep = () => {
    if (activeStep === "1") return setActiveStep("2");
    if (activeStep === "2") return setActiveStep("3");
    return setActiveStep("3");
  };

  const goToPreviousStep = () => {
    if (activeStep === "3") return setActiveStep("2");
    if (activeStep === "2") return setActiveStep("1");
    return setActiveStep("1");
  };

  const handlePricePerPersonChange = (value: string) => {
    setPricePerPerson(value.replace(/[^\d]/g, ""));
  };

  const handleDurationMinutesChange = (value: string) => {
    setDurationMinutes(value.replace(/[^\d]/g, ""));
  };

  async function handleCreateMatch(status: "publicada" | "rascunho") {
    if (creatingRef.current) return;
    creatingRef.current = true;

    try {
      await createMatch({
        title: venueName.trim() || t("form.untitledMatch"),
        description: description.trim(),
        modality: mode,
        matchDate: toIsoDate(matchDate),
        matchTime: toIsoTime(matchTime),
        turno: (turno || "noite") as (typeof TURNO_OPTIONS)[number]["value"],
        durationMinutes: Number(durationMinutes) || 60,
        pricePerPerson: Number(pricePerPerson) || 0,
        minAge,
        maxAge,
        acceptedLevels,
        allowExternalReserves: true,
        restBreak,
        refereeIncluded: referee,
        contactPhone: contactPhone.trim() || null,
        venueName: venueName.trim() || null,
        cep: cep.trim() || null,
        district: district.trim() || null,
        city: city.trim() || null,
        state: stateCode.trim() || null,
        address: address.trim() || null,
        selectedPositionIndexes,
        status,
        facilities: [
          { label: t("form.facilityLockerRoom"), selected: true },
          { label: t("form.facilityShower"), selected: true },
          { label: t("form.facilityParking"), selected: true },
          { label: t("form.facilitySnackBar"), selected: false },
        ],
      });

      const successMessage =
        status === "rascunho"
          ? t("form.draftSavedMessage")
          : t("form.matchPublishedMessage");

      Alert.alert(t("form.matchCreatedTitle"), successMessage, [
        {
          text: t("common.confirm", "Confirm"),
          onPress: () => router.replace("/(app)"),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("form.createFailedMessage");
      Alert.alert(t("form.createFailedTitle"), message);
    } finally {
      creatingRef.current = false;
    }
  }

  const monthYearLabel = webDateCursor.toLocaleDateString(currentLanguage, {
    month: "long",
    year: "numeric",
  });
  const currentYear = webDateCursor.getFullYear();
  const currentMonth = webDateCursor.getMonth();
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const monthDays = daysInMonth(currentYear, currentMonth);
  const leadingEmpty = Array.from({ length: firstWeekday });
  const dayNumbers = Array.from({ length: monthDays }, (_, idx) => idx + 1);
  const pitchWidth = Math.min(300, Math.max(248, screenWidth - 120));
  const pitchOffsetTop = 0;
  const minAgeFloor = 16;
  const maxAgeCeil = 80;

  return (
    <Screen padded={false} showBackground={false}>
      <MatchBackground />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 152 }}
      >
        <View className="px-[18px] pt-4 pb-1">
          <SectionTitle title={t("title")} badge={`${activeStep} / 3`} />
        </View>

        <StepIndicator total={3} current={Number(activeStep)} solidCurrent />

        <View className="px-[18px] pb-2">
          <SegmentedControl
            options={[
              { id: "1", label: "Informa\u00e7\u00f5es" },
              { id: "2", label: "Detalhes" },
              { id: "3", label: "Escala\u00e7\u00e3o" },
            ]}
            activeId={activeStep}
            onChange={(value) => goToStep(value as CreateStep)}
            appearance="flat"
            radius={28}
            containerColor={matchTheme.colors.bgSurfaceA}
            borderColor="rgba(34,183,108,0.35)"
          />
        </View>

        <View className="px-[18px] gap-[14px]">
          {activeStep === "1" ? (
            <CreateMatchStep1
              matchTheme={matchTheme}
              labels={{
                cep: t("form.cep"),
                district: t("form.district"),
                districtPlaceholder: t("form.districtPlaceholder"),
                venueName: t("form.venueName"),
                venueNamePlaceholder: t("form.venueNamePlaceholder"),
                state: t("form.state"),
                selectState: t("form.selectState"),
                city: t("form.city"),
                cityPlaceholder: t("form.cityPlaceholder"),
                address: t("form.address"),
                addressPlaceholder: t("form.addressPlaceholder"),
                date: t("filters.date", "Data"),
                selectDate: t("filters.date", "Data"),
                time: t("filters.time", "Hor\u00e1rio"),
                selectTime: t("filters.time", "Hor\u00e1rio"),
                shift: t("filters.shift", "Turno"),
                contactPhone: t("form.contactPhone"),
                contactPhonePlaceholder: "(00) 00000-0000",
              }}
              stateOptions={stateOptions}
              shiftOptions={TURNO_OPTIONS.map((item) => ({
                value: item.value,
                label:
                  item.value === "manha"
                    ? t("filters.shiftMorning", "Manha")
                    : item.value === "tarde"
                      ? t("filters.shiftAfternoon", "Tarde")
                      : t("filters.shiftNight", "Noite"),
              }))}
              cep={cep}
              district={district}
              venueName={venueName}
              stateCode={stateCode}
              city={city}
              address={address}
              contactPhone={contactPhone}
              dateValue={hasSelectedDate ? formatDateField(matchDate) : ""}
              timeValue={hasSelectedTime ? formatTimeField(matchTime) : ""}
              turno={turno}
              onCepChange={async (value) => {
                const formatted = formatCep(value);
                setCep(formatted);

                const cleanCep = formatted.replace(/\D/g, "");
                if (cleanCep.length !== 8) return;

                const addressData = await fetchAddressByCep(cleanCep);
                if (!addressData) return;

                setAddress(addressData.street || address);
                setCity(addressData.city);
                setDistrict(addressData.district || district);
                setStateCode(addressData.state);
              }}
              onDistrictChange={setDistrict}
              onVenueNameChange={setVenueName}
              onStateChange={setStateCode}
              onCityChange={setCity}
              onAddressChange={setAddress}
              onOpenDateModal={() => {
                setWebDateCursor(
                  new Date(matchDate.getFullYear(), matchDate.getMonth(), 1),
                );
                setShowWebDateModal(true);
              }}
              onOpenTimeModal={() => {
                setWebHour(matchTime.getHours());
                setWebMinute(matchTime.getMinutes());
                setShowWebTimeModal(true);
              }}
              onTurnoChange={(value) => setTurno(value as TurnoValue)}
              onContactPhoneChange={setContactPhone}
            />
          ) : null}

          {activeStep === "2" ? (
            <CreateMatchStep2
              matchTheme={matchTheme}
              titles={{ gameLevel: "N\u00edvel do Jogo" }}
              labels={{
                pricePerPerson: t("form.pricePerPerson"),
                durationMinutes: t("form.durationMinutes"),
                ageRestrictions: t("form.ageRestrictions"),
                ageRestrictionsHint: t("form.ageRestrictionsHint"),
                minimumLevelsAccepted: t("form.minimumLevelsAccepted"),
                restBreakTitle: t("form.restBreakTitle"),
                restBreakSubtitle: t("form.restBreakSubtitle"),
                refereeTitle: t("form.refereeTitle"),
                refereeSubtitle: t("form.refereeSubtitle"),
                levelOptionLabel: (value) => t(`form.levelOptions.${value}`),
              }}
              pricePerPerson={pricePerPerson}
              durationMinutes={durationMinutes}
              minAge={minAge}
              maxAge={maxAge}
              restBreak={restBreak}
              referee={referee}
              acceptedLevels={acceptedLevels}
              minLevelOptions={MIN_LEVEL_OPTIONS}
              onPricePerPersonChange={handlePricePerPersonChange}
              onDurationMinutesChange={handleDurationMinutesChange}
              onAgeRangeChange={(nextMin, nextMax) => {
                const safeMin = Math.max(
                  minAgeFloor,
                  Math.min(nextMin, maxAgeCeil - 1),
                );
                const safeMax = Math.min(
                  maxAgeCeil,
                  Math.max(nextMax, minAgeFloor + 1),
                );

                if (safeMin >= safeMax) return;
                setMinAge(safeMin);
                setMaxAge(safeMax);
              }}
              onToggleRestBreak={() => setRestBreak((value) => !value)}
              onToggleReferee={() => setReferee((value) => !value)}
              onToggleLevel={toggleLevel}
            />
          ) : null}

          {activeStep === "3" ? (
            <CreateMatchStep3
              matchTheme={matchTheme}
              titles={{ descriptionOptional: "Descri\u00e7\u00e3o (opcional)" }}
              labels={{
                positionsHint: t("form.positionsHint"),
                hostPosition: t("form.hostPosition"),
                confirmedCount: t("form.confirmedCount"),
                openSlotsCount: t("form.openSlotsCount"),
                blockedSlotCount: t("form.blockedSlotCount"),
                modalityFutsal: t("form.modalityFutsal"),
                modalitySociety: t("form.modalitySociety"),
                modalityCampo: t("form.modalityCampo"),
              }}
              mode={mode}
              selectedPositionIndexes={selectedPositionIndexes}
              pitchWidth={pitchWidth}
              pitchOffsetTop={pitchOffsetTop}
              description={description}
              onModeChange={setMode}
              onTogglePosition={togglePosition}
              onDescriptionChange={setDescription}
            />
          ) : null}

          {activeStep === "1" ? (
            <Button label="Próxima" fullWidth onPress={goToNextStep} />
          ) : null}

          {activeStep === "2" ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label="Voltar"
                  variant="ghost"
                  fullWidth
                  onPress={goToPreviousStep}
                />
              </View>
              <View className="flex-1">
                <Button label="Próxima" fullWidth onPress={goToNextStep} />
              </View>
            </View>
          ) : null}

          {activeStep === "3" ? (
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Button
                  label="Voltar"
                  variant="ghost"
                  fullWidth
                  onPress={goToPreviousStep}
                />
              </View>
              <View className="flex-1">
                <Button
                  label={t("form.createMatchButton")}
                  fullWidth
                  loading={submitting}
                  disabled={submitting}
                  onPress={() => handleCreateMatch("publicada")}
                />
              </View>
            </View>
          ) : null}

          <View className="h-2" />
        </View>
      </ScrollView>
      <MatchBottomNav active="new" compactBottomInset />

      <Modal
        transparent
        visible={showWebDateModal}
        onRequestClose={() => setShowWebDateModal(false)}
      >
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.62)" }}
        >
          <View
            className="w-full max-w-[420px] rounded-[18px] border p-4"
            style={{
              backgroundColor: matchTheme.colors.bgSurfaceA,
              borderColor: matchTheme.colors.lineStrong,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Button
                label="<"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() =>
                  setWebDateCursor(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
              />
              <Text
                variant="label"
                className="font-bold capitalize"
                style={{ color: matchTheme.colors.fgPrimary }}
              >
                {monthYearLabel}
              </Text>
              <Button
                label=">"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() =>
                  setWebDateCursor(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
              />
            </View>

            <View className="flex-row mb-2">
              {[
                t("filters.weekdaySun", "D"),
                t("filters.weekdayMon", "S"),
                t("filters.weekdayTue", "T"),
                t("filters.weekdayWed", "Q"),
                t("filters.weekdayThu", "Q"),
                t("filters.weekdayFri", "S"),
                t("filters.weekdaySat", "S"),
              ].map((weekDay, idx) => (
                <View
                  key={`weekday-${weekDay}-${idx}`}
                  className="flex-1 items-center"
                >
                  <Text
                    variant="micro"
                    style={{ color: matchTheme.colors.fgMuted }}
                  >
                    {weekDay}
                  </Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {leadingEmpty.map((_, idx) => (
                <View key={`empty-${idx}`} className="w-[14.28%] h-10" />
              ))}
              {dayNumbers.map((day) => {
                const isSelected =
                  matchDate.getFullYear() === currentYear &&
                  matchDate.getMonth() === currentMonth &&
                  matchDate.getDate() === day;

                return (
                  <Pressable
                    key={`day-${day}`}
                    className="w-[14.28%] h-10 items-center justify-center"
                    onPress={() => {
                      const selected = new Date(currentYear, currentMonth, day);
                      setMatchDate(selected);
                      setHasSelectedDate(true);
                      setShowWebDateModal(false);
                    }}
                  >
                    <View
                      className="h-8 w-8 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isSelected
                          ? matchTheme.colors.ok
                          : "transparent",
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: isSelected
                            ? "#05070B"
                            : matchTheme.colors.fgPrimary,
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Button
              label={t("common.close", "Fechar")}
              variant="ghost"
              size="md"
              className="mt-3"
              onPress={() => setShowWebDateModal(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={showWebTimeModal}
        onRequestClose={() => setShowWebTimeModal(false)}
      >
        <View
          className="flex-1 items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.62)" }}
        >
          <View
            className="w-full max-w-[420px] rounded-[18px] border p-4"
            style={{
              backgroundColor: matchTheme.colors.bgSurfaceA,
              borderColor: matchTheme.colors.lineStrong,
            }}
          >
            <Text
              variant="label"
              className="font-bold mb-3"
              style={{ color: matchTheme.colors.fgPrimary }}
            >
              {t("filters.selectTime", "Selecione o hor\u00e1rio")}
            </Text>
            <View className="flex-row items-center justify-center gap-4">
              <Button
                label="-"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebHour((h) => (h + 23) % 24)}
              />
              <Text
                variant="number"
                className="text-[34px]"
                style={{ color: matchTheme.colors.fgPrimary }}
              >
                {String(webHour).padStart(2, "0")}
              </Text>
              <Text
                variant="number"
                className="text-[34px]"
                style={{ color: matchTheme.colors.fgMuted }}
              >
                :
              </Text>
              <Text
                variant="number"
                className="text-[34px]"
                style={{ color: matchTheme.colors.fgPrimary }}
              >
                {String(webMinute).padStart(2, "0")}
              </Text>
              <Button
                label="+"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebHour((h) => (h + 1) % 24)}
              />
            </View>
            <View className="flex-row items-center justify-center gap-2 mt-3">
              <Button
                label="- min"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebMinute((m) => (m + 55) % 60)}
              />
              <Button
                label="+ min"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setWebMinute((m) => (m + 5) % 60)}
              />
            </View>
            <Button
              label={t("common.confirm", "Confirmar")}
              size="md"
              className="mt-4"
              onPress={() => {
                const selected = new Date(matchTime);
                selected.setHours(webHour, webMinute, 0, 0);
                setMatchTime(selected);
                setHasSelectedTime(true);
                setShowWebTimeModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
