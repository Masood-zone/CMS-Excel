import ButtonLoader from "@/components/shared/button-loader/button-loader";
import GoBackButton from "@/components/shared/go-back/go-back";
import { PageHeading } from "@/components/typography/heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdmin } from "@/services/api/queries";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function AddAdmin() {
  const { mutate: createAdmin, isLoading } = useCreateAdmin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Admin>();
  const gender = watch("gender");
  const onSubmit: SubmitHandler<Admin> = async (data) => {
    const adminData = {
      name: data.name,
      email: data.email,
      gender: gender,
      phone: data.phone,
      password: data.password,
      role: "SUPER_ADMIN",
    };
    try {
      await createAdmin(adminData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="w-full px-2 sm:px-0">
      <Card className="w-full bg-transparent border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <PageHeading>Register Admin</PageHeading>
            <GoBackButton />
          </CardTitle>
          <CardDescription>
            <p>Register a new admin to the platform</p>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="name"
                id="name"
                {...register("name", { required: true })}
                autoComplete="off"
                className="bg-transparent"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name?.message || "Name is required"}
                </p>
              )}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                {...register("email", { required: true })}
                autoComplete="off"
                required
                className="bg-transparent"
              />
              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email?.message || "Email is required"}
                </p>
              )}
            </div>
            {/* Telephone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="text"
                id="phone"
                {...register("phone", { required: true })}
                autoComplete="off"
                className="bg-transparent"
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-500">
                  {errors.phone?.message || "Phone number is required"}
                </p>
              )}
            </div>
            {/* Gender */}
            <div className="space-y-2">
              <Label className="block" htmlFor="gender">
                Gender
              </Label>
              <Select
                value={gender}
                onValueChange={(value) =>
                  setValue("gender", value as "male" | "female", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger name="gender" className="bg-transparent">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="password">Credentials</Label>
              </div>
              <Input
                type="password"
                id="password"
                {...register("password", {
                  required: true,
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  maxLength: {
                    value: 20,
                    message: "Password must not exceed 20 characters",
                  },
                })}
                autoComplete="off"
                className="bg-transparent"
                required
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password?.message || "Password is required"}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full text-xs sm:text-base"
              disabled={isLoading}
            >
              <ButtonLoader
                isPending={isLoading}
                loadingText="Creating Administrator..."
                fallback="Create Administrator"
              />
            </Button>
          </CardContent>
          <CardFooter>
            <div className="space-x-0 sm:space-x-4 text-center text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link to="/contact-us" className="text-sm hover:text-primary">
                Facing issues? Contact us
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
}
