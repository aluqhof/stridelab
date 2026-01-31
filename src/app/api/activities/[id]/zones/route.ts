import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const activityId = parseInt(id);

  if (isNaN(activityId)) {
    return NextResponse.json({ error: "Invalid activity ID" }, { status: 400 });
  }

  try {
    const athleteZonesRes = await fetch(`${STRAVA_API_BASE}/athlete/zones`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!athleteZonesRes.ok) {
      return NextResponse.json([]);
    }

    const athleteZones = await athleteZonesRes.json();

    // Get activity streams (HR data)
    const streamsRes = await fetch(
      `${STRAVA_API_BASE}/activities/${activityId}/streams?keys=time,heartrate&key_by_type=true`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );

    if (!streamsRes.ok) {
      return NextResponse.json([]);
    }

    const streams = await streamsRes.json();

    // Check if we have HR data
    if (!streams.heartrate || !streams.time) {
      return NextResponse.json([]);
    }

    const hrData = streams.heartrate.data as number[];
    const timeData = streams.time.data as number[];
    const hrZones = athleteZones.heart_rate?.zones;

    if (!hrZones || hrZones.length === 0) {
      return NextResponse.json([]);
    }

    // Calculate time in each zone
    const zoneDistribution = hrZones.map(
      (zone: { min: number; max: number }) => ({
        min: zone.min,
        max: zone.max === -1 ? 999 : zone.max,
        time: 0,
      }),
    );

    // Go through each HR data point and accumulate time in zones
    for (let i = 0; i < hrData.length; i++) {
      const hr = hrData[i];
      const timeDelta = i === 0 ? timeData[0] : timeData[i] - timeData[i - 1];

      // Find which zone this HR falls into
      for (const zone of zoneDistribution) {
        if (hr >= zone.min && hr < zone.max) {
          zone.time += timeDelta;
          break;
        }
      }
    }

    // Format response like Strava's zones endpoint
    const result = [
      {
        type: "heartrate" as const,
        sensor_based: true,
        distribution_buckets: zoneDistribution.map(
          (z: { min: number; max: number; time: number }) => ({
            min: z.min,
            max: z.max === 999 ? -1 : z.max,
            time: Math.round(z.time),
          }),
        ),
      },
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating activity zones:", error);
    return NextResponse.json([]);
  }
}
