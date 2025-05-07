import ButtonLoader from "@/components/shared/button-loader/button-loader";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTeacher } from "@/services/api/queries";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function EditAdminForm({ adminData }: { adminData: Admin }) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: updateTeacher, isLoading } = useUpdateTeacher();
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Admin>();

  const gender = watch(
    "gender",
    adminData?.gender as "male" | "female" | undefined
  );

  const onSubmit = async (data: Admin) => {
    try {
      updateTeacher({
        ...data,
        id: adminData.id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            type="name"
            id="name"
            {...register("name")}
            autoComplete="off"
            defaultValue={adminData?.name}
            className="bg-transparent"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-sm">Full Name is required</p>
          )}
        </div>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            {...register("email")}
            autoComplete="off"
            defaultValue={adminData?.email}
            className="bg-transparent"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm">Email is required</p>
          )}
        </div>
        {/* Phone number */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            {...register("phone")}
            autoComplete="off"
            defaultValue={adminData?.phone}
            className="bg-transparent"
            required
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">Phone number is required</p>
          )}
        </div>
        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={gender} // Bind `Select`'s value to `watch` output
            onValueChange={(value) =>
              setValue("gender", value as "male" | "female", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="bg-transparent">
              <SelectValue
                placeholder={adminData?.gender || "Male/Female"}
                className="capitalize"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Password */}
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Credentials</Label>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            autoComplete="off"
            placeholder="Password"
            defaultValue={adminData?.password}
            className="bg-transparent"
          />
          <span className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 pt-3">
            {showPassword ? (
              <Eye onClick={() => setShowPassword(!showPassword)} />
            ) : (
              <EyeClosed onClick={() => setShowPassword(!showPassword)} />
            )}
          </span>
        </div>
        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          <ButtonLoader
            isPending={isLoading}
            fallback="Update Teacher"
            loadingText="Updating Teacher..."
          />
        </Button>
      </CardContent>
      <CardFooter>
        <div className="space-x-4 text-center text-gray-500">
          <Link to="/contact-us" className="text-sm hover:text-primary">
            Facing issues? Contact us
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
