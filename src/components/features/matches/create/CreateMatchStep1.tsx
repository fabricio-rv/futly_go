import { View } from "react-native";

import { DateTimeField } from "@/src/components/features/matches/create/DateTimeField";
import { Card, Input, SelectField } from "@/src/components/ui";
import { useMatchTheme } from "@/src/components/features/matches/shared/theme";

type StepOption = {
  value: string;
  label: string;
  description?: string;
};

type CreateMatchStep1Props = {
  matchTheme: ReturnType<typeof useMatchTheme>;
  labels: {
    cep: string;
    district: string;
    districtPlaceholder: string;
    venueName: string;
    venueNamePlaceholder: string;
    state: string;
    selectState: string;
    city: string;
    cityPlaceholder: string;
    address: string;
    addressPlaceholder: string;
    date: string;
    selectDate: string;
    time: string;
    selectTime: string;
    shift: string;
    contactPhone: string;
    contactPhonePlaceholder: string;
  };
  stateOptions: StepOption[];
  shiftOptions: StepOption[];
  cep: string;
  district: string;
  venueName: string;
  stateCode: string;
  city: string;
  address: string;
  contactPhone: string;
  dateValue: string;
  timeValue: string;
  turno: string;
  onCepChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
  onVenueNameChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onOpenDateModal: () => void;
  onOpenTimeModal: () => void;
  onTurnoChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
};

export function CreateMatchStep1({
  matchTheme,
  labels,
  stateOptions,
  shiftOptions,
  cep,
  district,
  venueName,
  stateCode,
  city,
  address,
  contactPhone,
  dateValue,
  timeValue,
  turno,
  onCepChange,
  onDistrictChange,
  onVenueNameChange,
  onStateChange,
  onCityChange,
  onAddressChange,
  onOpenDateModal,
  onOpenTimeModal,
  onTurnoChange,
  onContactPhoneChange,
}: CreateMatchStep1Props) {
  return (
    <View className="gap-[14px]">
      <Card
        className="p-4"
        style={{
          backgroundColor: matchTheme.colors.bgSurfaceA,
          borderColor: "rgba(34,183,108,0.35)",
        }}
      >
        <View className="gap-3">
          <View className="flex-row gap-2">
            <View className="flex-1">
              <DateTimeField
                label={labels.date}
                value={dateValue}
                placeholder={labels.selectDate}
                onPress={onOpenDateModal}
              />
            </View>
            <View className="flex-1">
              <DateTimeField
                label={labels.time}
                value={timeValue}
                placeholder={labels.selectTime}
                onPress={onOpenTimeModal}
              />
            </View>
            <View className="flex-1">
              <SelectField
                label={labels.shift}
                value={turno}
                options={shiftOptions}
                placeholder={labels.shift}
                onChange={onTurnoChange}
              />
            </View>
          </View>

          <Input
            label={labels.contactPhone}
            value={contactPhone}
            onChangeText={onContactPhoneChange}
            keyboardType="phone-pad"
            placeholder={labels.contactPhonePlaceholder}
          />

          <Input
            label={labels.cep}
            value={cep}
            onChangeText={onCepChange}
            keyboardType="number-pad"
            placeholder="00000-000"
          />

          <Input
            label={labels.district}
            value={district}
            onChangeText={onDistrictChange}
            placeholder={labels.districtPlaceholder}
          />

          <Input
            label={labels.venueName}
            value={venueName}
            onChangeText={onVenueNameChange}
            placeholder={labels.venueNamePlaceholder}
          />

          <View className="flex-row gap-2">
            <View className="flex-1">
              <SelectField
                label={labels.state}
                value={stateCode}
                options={stateOptions}
                searchable
                placeholder={labels.selectState}
                onChange={onStateChange}
              />
            </View>
            <View className="flex-1">
              <Input
                label={labels.city}
                value={city}
                onChangeText={onCityChange}
                placeholder={labels.cityPlaceholder}
              />
            </View>
          </View>

          <Input
            label={labels.address}
            value={address}
            onChangeText={onAddressChange}
            placeholder={labels.addressPlaceholder}
          />
        </View>
      </Card>
    </View>
  );
}
